package com.ondrecreates.monitoringdashboard.service;

import com.ondrecreates.monitoringdashboard.domain.Metric;
import com.ondrecreates.monitoringdashboard.domain.Service;
import com.ondrecreates.monitoringdashboard.repository.MetricRepository;
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

    public Metric record(Service service, String name, double value) {
        Metric metric = new Metric();
        metric.setService(service);
        metric.setName(name);
        metric.setValue(value);
        return metricRepository.save(metric);
    }
}
