package com.ondrecreates.monitoringdashboard.service;

import com.ondrecreates.monitoringdashboard.domain.Metric;
import com.ondrecreates.monitoringdashboard.domain.Service;
import com.ondrecreates.monitoringdashboard.repository.ServiceRepository;
import com.ondrecreates.monitoringdashboard.sse.ServiceStatusBroadcaster;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Pull-model metric collection (see docs/architecture.md): actively polls every
 * registered {@link Service} over HTTP instead of waiting for services to push data in.
 */
@Component
public class MetricCollectorScheduler {

    private static final Logger log = LoggerFactory.getLogger(MetricCollectorScheduler.class);

    private final ServiceRepository serviceRepository;
    private final MetricService metricService;
    private final RestClient restClient;
    private final ServiceStatusBroadcaster broadcaster;

    public MetricCollectorScheduler(
            ServiceRepository serviceRepository,
            MetricService metricService,
            RestClient restClient,
            ServiceStatusBroadcaster broadcaster) {
        this.serviceRepository = serviceRepository;
        this.metricService = metricService;
        this.restClient = restClient;
        this.broadcaster = broadcaster;
    }

    @Scheduled(fixedDelayString = "${monitoring.poll-interval-ms:30000}")
    public void pollServices() {
        serviceRepository.findAll().forEach(this::pollService);
    }

    private void pollService(Service service) {
        long start = System.currentTimeMillis();
        try {
            restClient.get().uri(service.getUrl()).retrieve().toBodilessEntity();
            long responseTimeMs = System.currentTimeMillis() - start;
            Metric metric = metricService.record(service, "response_time_ms", responseTimeMs);
            broadcaster.broadcastMetric(service, metric);
        } catch (Exception ex) {
            log.warn("Polling service '{}' at {} failed: {}", service.getName(), service.getUrl(), ex.getMessage());
        }
    }
}
