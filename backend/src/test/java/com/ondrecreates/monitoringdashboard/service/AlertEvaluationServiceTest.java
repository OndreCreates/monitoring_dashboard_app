package com.ondrecreates.monitoringdashboard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ondrecreates.monitoringdashboard.domain.Alert;
import com.ondrecreates.monitoringdashboard.domain.AlertComparison;
import com.ondrecreates.monitoringdashboard.domain.AlertEvent;
import com.ondrecreates.monitoringdashboard.domain.AlertEventStatus;
import com.ondrecreates.monitoringdashboard.domain.Service;
import com.ondrecreates.monitoringdashboard.repository.AlertEventRepository;
import com.ondrecreates.monitoringdashboard.repository.AlertRepository;
import com.ondrecreates.monitoringdashboard.sse.ServiceStatusBroadcaster;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AlertEvaluationServiceTest {

    @Mock
    AlertRepository alertRepository;

    @Mock
    AlertEventRepository alertEventRepository;

    @Mock
    ServiceStatusBroadcaster broadcaster;

    @Mock
    EventService eventService;

    AlertEvaluationService alertEvaluationService;

    Service service;
    Alert alert;

    @BeforeEach
    void setUp() {
        alertEvaluationService =
                new AlertEvaluationService(alertRepository, alertEventRepository, broadcaster, eventService);

        service = new Service();
        service.setId(1L);
        service.setName("demo-service-a");

        alert = new Alert();
        alert.setId(10L);
        alert.setService(service);
        alert.setMetricName("response_time_ms");
        alert.setThreshold(500.0);
        alert.setComparison(AlertComparison.GREATER_THAN);
        alert.setEnabled(true);
    }

    @Test
    void createsTriggeredEventWhenThresholdBreachedAndNoneActive() {
        when(alertRepository.findByServiceIdAndMetricNameAndEnabledTrue(1L, "response_time_ms"))
                .thenReturn(List.of(alert));
        when(alertEventRepository.findFirstByAlertIdAndStatusOrderByTriggeredAtDesc(
                        10L, AlertEventStatus.TRIGGERED))
                .thenReturn(Optional.empty());

        alertEvaluationService.evaluate(service, "response_time_ms", 800.0);

        ArgumentCaptor<AlertEvent> captor = ArgumentCaptor.forClass(AlertEvent.class);
        verify(alertEventRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(AlertEventStatus.TRIGGERED);
        assertThat(captor.getValue().getTriggeringValue()).isEqualTo(800.0);
        verify(eventService).recordAlertTriggered(service, alert, 800.0);
    }

    @Test
    void doesNotCreateDuplicateTriggeredEventWhileConditionPersists() {
        when(alertRepository.findByServiceIdAndMetricNameAndEnabledTrue(1L, "response_time_ms"))
                .thenReturn(List.of(alert));
        AlertEvent existing = new AlertEvent();
        existing.setStatus(AlertEventStatus.TRIGGERED);
        when(alertEventRepository.findFirstByAlertIdAndStatusOrderByTriggeredAtDesc(
                        10L, AlertEventStatus.TRIGGERED))
                .thenReturn(Optional.of(existing));

        alertEvaluationService.evaluate(service, "response_time_ms", 900.0);

        verify(alertEventRepository, never()).save(any());
    }

    @Test
    void resolvesActiveEventWhenValueReturnsBelowThreshold() {
        when(alertRepository.findByServiceIdAndMetricNameAndEnabledTrue(1L, "response_time_ms"))
                .thenReturn(List.of(alert));
        AlertEvent existing = new AlertEvent();
        existing.setStatus(AlertEventStatus.TRIGGERED);
        when(alertEventRepository.findFirstByAlertIdAndStatusOrderByTriggeredAtDesc(
                        10L, AlertEventStatus.TRIGGERED))
                .thenReturn(Optional.of(existing));

        alertEvaluationService.evaluate(service, "response_time_ms", 100.0);

        assertThat(existing.getStatus()).isEqualTo(AlertEventStatus.RESOLVED);
        assertThat(existing.getResolvedAt()).isNotNull();
        verify(eventService).recordAlertResolved(service, alert);
    }
}
