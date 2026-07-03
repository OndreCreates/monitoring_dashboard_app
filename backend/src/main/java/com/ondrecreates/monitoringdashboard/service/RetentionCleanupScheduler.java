package com.ondrecreates.monitoringdashboard.service;

import com.ondrecreates.monitoringdashboard.repository.EventRepository;
import com.ondrecreates.monitoringdashboard.repository.MetricRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Metrics and events accumulate without bound otherwise (see docs/architecture.md) —
 * this periodically deletes rows older than the configured retention window.
 */
@Component
public class RetentionCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(RetentionCleanupScheduler.class);

    private final MetricRepository metricRepository;
    private final EventRepository eventRepository;
    private final int metricsRetentionDays;
    private final int eventsRetentionDays;

    public RetentionCleanupScheduler(
            MetricRepository metricRepository,
            EventRepository eventRepository,
            @Value("${retention.metrics-days:7}") int metricsRetentionDays,
            @Value("${retention.events-days:30}") int eventsRetentionDays) {
        this.metricRepository = metricRepository;
        this.eventRepository = eventRepository;
        this.metricsRetentionDays = metricsRetentionDays;
        this.eventsRetentionDays = eventsRetentionDays;
    }

    @Scheduled(cron = "${retention.cleanup-cron:0 0 3 * * *}")
    public void cleanup() {
        Instant metricsCutoff = Instant.now().minus(metricsRetentionDays, ChronoUnit.DAYS);
        long deletedMetrics = metricRepository.deleteByRecordedAtBefore(metricsCutoff);

        Instant eventsCutoff = Instant.now().minus(eventsRetentionDays, ChronoUnit.DAYS);
        long deletedEvents = eventRepository.deleteByOccurredAtBefore(eventsCutoff);

        log.info(
                "Retention cleanup: smazáno {} metrik (starších {} dní) a {} eventů (starších {} dní)",
                deletedMetrics,
                metricsRetentionDays,
                deletedEvents,
                eventsRetentionDays);
    }
}
