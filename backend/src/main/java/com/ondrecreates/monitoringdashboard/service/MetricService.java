package com.ondrecreates.monitoringdashboard.service;

import com.ondrecreates.monitoringdashboard.domain.Metric;
import com.ondrecreates.monitoringdashboard.domain.Service;
import com.ondrecreates.monitoringdashboard.repository.MetricRepository;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class MetricService {

    private final MetricRepository metricRepository;

    public MetricService(MetricRepository metricRepository) {
        this.metricRepository = metricRepository;
    }

    public List<Metric> findByService(Long serviceId) {
        return metricRepository.findByServiceIdOrderByRecordedAtDesc(serviceId);
    }

    public Metric record(Service service, String name, double value) {
        Metric metric = new Metric();
        metric.setService(service);
        metric.setName(name);
        metric.setValue(value);
        return metricRepository.save(metric);
    }
}
