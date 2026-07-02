package com.ondrecreates.monitoringdashboard.service;

import com.ondrecreates.monitoringdashboard.domain.Alert;
import com.ondrecreates.monitoringdashboard.domain.AlertEvent;
import com.ondrecreates.monitoringdashboard.domain.AlertEventStatus;
import com.ondrecreates.monitoringdashboard.domain.Service;
import com.ondrecreates.monitoringdashboard.repository.AlertEventRepository;
import com.ondrecreates.monitoringdashboard.repository.AlertRepository;
import com.ondrecreates.monitoringdashboard.sse.AlertEventNotification;
import com.ondrecreates.monitoringdashboard.sse.ServiceStatusBroadcaster;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

/**
 * Compares a freshly recorded metric against enabled {@link Alert} rules for the same
 * service + metric name, opening/closing {@link AlertEvent}s as the threshold is crossed.
 */
@Component
public class AlertEvaluationService {

    private final AlertRepository alertRepository;
    private final AlertEventRepository alertEventRepository;
    private final ServiceStatusBroadcaster broadcaster;
    private final EventService eventService;

    public AlertEvaluationService(
            AlertRepository alertRepository,
            AlertEventRepository alertEventRepository,
            ServiceStatusBroadcaster broadcaster,
            EventService eventService) {
        this.alertRepository = alertRepository;
        this.alertEventRepository = alertEventRepository;
        this.broadcaster = broadcaster;
        this.eventService = eventService;
    }

    public void evaluate(Service service, String metricName, double value) {
        List<Alert> alerts =
                alertRepository.findByServiceIdAndMetricNameAndEnabledTrue(service.getId(), metricName);
        for (Alert alert : alerts) {
            evaluateAlert(service, alert, value);
        }
    }

    private void evaluateAlert(Service service, Alert alert, double value) {
        boolean breached = isBreached(alert, value);
        Optional<AlertEvent> activeEvent = alertEventRepository.findFirstByAlertIdAndStatusOrderByTriggeredAtDesc(
                alert.getId(), AlertEventStatus.TRIGGERED);

        if (breached && activeEvent.isEmpty()) {
            AlertEvent event = new AlertEvent();
            event.setAlert(alert);
            event.setTriggeringValue(value);
            event.setStatus(AlertEventStatus.TRIGGERED);
            alertEventRepository.save(event);
            broadcast(service, alert, event, event.getTriggeredAt());
            eventService.recordAlertTriggered(service, alert, value);
        } else if (!breached && activeEvent.isPresent()) {
            AlertEvent event = activeEvent.get();
            event.setStatus(AlertEventStatus.RESOLVED);
            event.setResolvedAt(Instant.now());
            alertEventRepository.save(event);
            broadcast(service, alert, event, event.getResolvedAt());
            eventService.recordAlertResolved(service, alert);
        }
        // breached && already TRIGGERED, or !breached && no active event: nothing to do —
        // avoids spamming a new AlertEvent on every poll cycle while the condition persists.
    }

    private boolean isBreached(Alert alert, double value) {
        return switch (alert.getComparison()) {
            case GREATER_THAN -> value > alert.getThreshold();
            case LESS_THAN -> value < alert.getThreshold();
        };
    }

    private void broadcast(Service service, Alert alert, AlertEvent event, Instant timestamp) {
        broadcaster.broadcastAlertEvent(new AlertEventNotification(
                alert.getId(),
                service.getId(),
                service.getName(),
                alert.getMetricName(),
                event.getTriggeringValue(),
                event.getStatus().name(),
                timestamp));
    }
}
