package com.ondrecreates.monitoringdashboard.service;

import com.ondrecreates.monitoringdashboard.domain.Metric;
import com.ondrecreates.monitoringdashboard.domain.Service;
import com.ondrecreates.monitoringdashboard.repository.ServiceRepository;
import com.ondrecreates.monitoringdashboard.sse.ServiceStatusBroadcaster;
import java.util.List;
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
        pollHealthAndResponseTime(service);
        pollActuatorMetric(service, "system.cpu.usage", "cpu_usage");
        pollActuatorMetric(service, "jvm.memory.used", "memory_used");
    }

    private void pollHealthAndResponseTime(Service service) {
        long start = System.currentTimeMillis();
        boolean healthy;
        try {
            restClient.get().uri(service.getUrl()).retrieve().toBodilessEntity();
            healthy = true;
        } catch (Exception ex) {
            healthy = false;
            log.warn("Health check for '{}' at {} failed: {}", service.getName(), service.getUrl(), ex.getMessage());
        }
        long responseTimeMs = System.currentTimeMillis() - start;

        record(service, "health_status", healthy ? 1.0 : 0.0);
        if (healthy) {
            record(service, "response_time_ms", (double) responseTimeMs);
        }
    }

    private void pollActuatorMetric(Service service, String actuatorMetricName, String recordedMetricName) {
        try {
            String metricsUrl = toMetricsUrl(service.getUrl(), actuatorMetricName);
            ActuatorMetricResponse response =
                    restClient.get().uri(metricsUrl).retrieve().body(ActuatorMetricResponse.class);
            double value = response.measurements().stream()
                    .filter(measurement -> "VALUE".equals(measurement.statistic()))
                    .findFirst()
                    .map(ActuatorMeasurement::value)
                    .orElseThrow();
            record(service, recordedMetricName, value);
        } catch (Exception ex) {
            // No value is better than a fake zero — just skip this cycle for this metric.
            log.warn(
                    "Fetching '{}' for '{}' failed: {}", actuatorMetricName, service.getName(), ex.getMessage());
        }
    }

    private void record(Service service, String metricName, double value) {
        Metric metric = metricService.record(service, metricName, value);
        broadcaster.broadcastMetric(service, metric);
    }

    /** Derives {@code <base>/actuator/metrics/<name>} from a service's health-check URL. */
    private String toMetricsUrl(String healthUrl, String actuatorMetricName) {
        String base = healthUrl.replaceFirst("/actuator/.*$", "");
        return base + "/actuator/metrics/" + actuatorMetricName;
    }

    private record ActuatorMetricResponse(List<ActuatorMeasurement> measurements) {}

    private record ActuatorMeasurement(String statistic, double value) {}
}
