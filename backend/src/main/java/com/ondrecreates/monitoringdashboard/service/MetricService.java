package com.ondrecreates.monitoringdashboard.service;

import com.ondrecreates.monitoringdashboard.domain.Metric;
import com.ondrecreates.monitoringdashboard.domain.Service;
import com.ondrecreates.monitoringdashboard.repository.MetricRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
public class MetricService {

    private final MetricRepository metricRepository;

    public MetricService(MetricRepository metricRepository) {
        this.metricRepository = metricRepository;
    }

    public Page<Metric> findByService(Long serviceId, String name, Pageable pageable) {
        if (name == null || name.isBlank()) {
            return metricRepository.findByServiceId(serviceId, pageable);
        }
        return metricRepository.findByServiceIdAndName(serviceId, name, pageable);
    }

    /** Null means "no health_status samples yet in the window" (e.g. freshly registered service). */
    public Double calculateUptimePercentage(Long serviceId, int days) {
        Instant since = Instant.now().minus(days, ChronoUnit.DAYS);
        return metricRepository
                .averageValueSince(serviceId, "health_status", since)
                .map(fraction -> fraction * 100)
                .orElse(null);
    }

    public Metric record(Service service, String name, double value) {
        Metric metric = new Metric();
        metric.setService(service);
        metric.setName(name);
        metric.setValue(value);
        return metricRepository.save(metric);
    }
}
