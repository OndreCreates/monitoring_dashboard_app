package com.ondrecreates.monitoringdashboard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.ondrecreates.monitoringdashboard.repository.EventRepository;
import com.ondrecreates.monitoringdashboard.repository.MetricRepository;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RetentionCleanupSchedulerTest {

    @Mock
    MetricRepository metricRepository;

    @Mock
    EventRepository eventRepository;

    RetentionCleanupScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new RetentionCleanupScheduler(metricRepository, eventRepository, 7, 30);
    }

    @Test
    void cleanupDeletesMetricsAndEventsOlderThanTheirRetentionWindow() {
        when(metricRepository.deleteByRecordedAtBefore(any())).thenReturn(5L);
        when(eventRepository.deleteByOccurredAtBefore(any())).thenReturn(2L);

        scheduler.cleanup();

        ArgumentCaptor<Instant> metricsCutoff = ArgumentCaptor.forClass(Instant.class);
        ArgumentCaptor<Instant> eventsCutoff = ArgumentCaptor.forClass(Instant.class);
        org.mockito.Mockito.verify(metricRepository).deleteByRecordedAtBefore(metricsCutoff.capture());
        org.mockito.Mockito.verify(eventRepository).deleteByOccurredAtBefore(eventsCutoff.capture());

        Instant expectedMetricsCutoff = Instant.now().minus(7, ChronoUnit.DAYS);
        Instant expectedEventsCutoff = Instant.now().minus(30, ChronoUnit.DAYS);

        assertThat(Duration.between(metricsCutoff.getValue(), expectedMetricsCutoff).abs())
                .isLessThan(Duration.ofSeconds(5));
        assertThat(Duration.between(eventsCutoff.getValue(), expectedEventsCutoff).abs())
                .isLessThan(Duration.ofSeconds(5));
    }
}
