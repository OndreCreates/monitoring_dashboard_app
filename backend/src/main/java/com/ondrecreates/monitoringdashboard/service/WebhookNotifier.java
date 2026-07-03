package com.ondrecreates.monitoringdashboard.service;

import com.ondrecreates.monitoringdashboard.domain.Alert;
import com.ondrecreates.monitoringdashboard.domain.AlertEventStatus;
import com.ondrecreates.monitoringdashboard.domain.Service;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Best-effort push to an external chat webhook (Slack/Discord) when an alert fires or
 * resolves. The URL lives in an env var, not the DB — it's secret-like (whoever has it
 * can post to the channel), same reasoning as DB credentials.
 */
@Component
public class WebhookNotifier {

    private static final Logger log = LoggerFactory.getLogger(WebhookNotifier.class);

    private final RestClient restClient;
    private final String webhookUrl;
    private final boolean discordFormat;

    public WebhookNotifier(
            RestClient restClient,
            @Value("${webhook.url:}") String webhookUrl,
            @Value("${webhook.format:slack}") String format) {
        this.restClient = restClient;
        this.webhookUrl = webhookUrl;
        this.discordFormat = "discord".equalsIgnoreCase(format);
    }

    public void notifyAlert(Service service, Alert alert, AlertEventStatus status, double triggeringValue) {
        if (webhookUrl == null || webhookUrl.isBlank()) return;

        String verb = status == AlertEventStatus.TRIGGERED ? "spuštěn" : "vyřešen";
        String comparisonSymbol = switch (alert.getComparison()) {
            case GREATER_THAN -> ">";
            case LESS_THAN -> "<";
        };
        String message = "Alert %s — %s: %s %s %s (aktuální hodnota %s)"
                .formatted(
                        verb,
                        service.getName(),
                        alert.getMetricName(),
                        comparisonSymbol,
                        alert.getThreshold(),
                        triggeringValue);

        Map<String, String> body = Map.of(discordFormat ? "content" : "text", message);

        try {
            restClient.post().uri(webhookUrl).body(body).retrieve().toBodilessEntity();
        } catch (Exception ex) {
            // Same rule as everywhere else here: a broken webhook must never break alert evaluation.
            log.warn("Webhook notifikace selhala: {}", ex.getMessage());
        }
    }
}
