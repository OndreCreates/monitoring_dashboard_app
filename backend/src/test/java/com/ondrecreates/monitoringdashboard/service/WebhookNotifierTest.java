package com.ondrecreates.monitoringdashboard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.ondrecreates.monitoringdashboard.domain.Alert;
import com.ondrecreates.monitoringdashboard.domain.AlertComparison;
import com.ondrecreates.monitoringdashboard.domain.AlertEventStatus;
import com.ondrecreates.monitoringdashboard.domain.Service;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.web.client.RestClient;

class WebhookNotifierTest {

    private Alert alert() {
        Alert alert = new Alert();
        alert.setMetricName("response_time_ms");
        alert.setThreshold(100.0);
        alert.setComparison(AlertComparison.GREATER_THAN);
        return alert;
    }

    private Service service() {
        Service service = new Service();
        service.setName("demo-service-a");
        return service;
    }

    @Test
    void notifyAlertSkipsHttpCallWhenUrlIsBlank() {
        RestClient restClient = mock(RestClient.class);
        WebhookNotifier notifier = new WebhookNotifier(restClient, "", "slack");

        notifier.notifyAlert(service(), alert(), AlertEventStatus.TRIGGERED, 150.0);

        verifyNoInteractions(restClient);
    }

    @Test
    @SuppressWarnings("unchecked")
    void notifyAlertPostsSlackFormattedBodyWhenUrlConfigured() {
        RestClient restClient = mock(RestClient.class, RETURNS_DEEP_STUBS);
        RestClient.RequestBodyUriSpec postSpec = restClient.post();
        RestClient.RequestBodySpec uriSpec = postSpec.uri(anyString());
        WebhookNotifier notifier = new WebhookNotifier(restClient, "https://hooks.slack.com/test", "slack");

        notifier.notifyAlert(service(), alert(), AlertEventStatus.TRIGGERED, 150.0);

        verify(postSpec).uri("https://hooks.slack.com/test");
        ArgumentCaptor<Map<String, String>> bodyCaptor = ArgumentCaptor.forClass(Map.class);
        verify(uriSpec).body(bodyCaptor.capture());
        assertThat(bodyCaptor.getValue()).containsKey("text");
        assertThat(bodyCaptor.getValue().get("text")).contains("demo-service-a", "response_time_ms");
    }

    @Test
    @SuppressWarnings("unchecked")
    void notifyAlertUsesDiscordContentKeyWhenFormatIsDiscord() {
        RestClient restClient = mock(RestClient.class, RETURNS_DEEP_STUBS);
        RestClient.RequestBodyUriSpec postSpec = restClient.post();
        RestClient.RequestBodySpec uriSpec = postSpec.uri(anyString());
        WebhookNotifier notifier = new WebhookNotifier(restClient, "https://discord.com/api/webhooks/test", "discord");

        notifier.notifyAlert(service(), alert(), AlertEventStatus.RESOLVED, 50.0);

        ArgumentCaptor<Map<String, String>> bodyCaptor = ArgumentCaptor.forClass(Map.class);
        verify(uriSpec).body(bodyCaptor.capture());
        assertThat(bodyCaptor.getValue()).containsKey("content");
    }
}
