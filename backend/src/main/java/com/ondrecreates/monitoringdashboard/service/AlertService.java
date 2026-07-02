package com.ondrecreates.monitoringdashboard.service;

import com.ondrecreates.monitoringdashboard.api.dto.AlertRequest;
import com.ondrecreates.monitoringdashboard.domain.Alert;
import com.ondrecreates.monitoringdashboard.domain.Service;
import com.ondrecreates.monitoringdashboard.exception.ResourceNotFoundException;
import com.ondrecreates.monitoringdashboard.repository.AlertRepository;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class AlertService {

    private final AlertRepository alertRepository;
    private final ServiceService serviceService;

    public AlertService(AlertRepository alertRepository, ServiceService serviceService) {
        this.alertRepository = alertRepository;
        this.serviceService = serviceService;
    }

    public List<Alert> findAll() {
        return alertRepository.findAll();
    }

    public List<Alert> findByService(Long serviceId) {
        return alertRepository.findByServiceId(serviceId);
    }

    public Alert findById(Long id) {
        return alertRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Alert " + id + " not found"));
    }

    public Alert create(AlertRequest request) {
        Alert alert = new Alert();
        applyRequest(alert, request);
        return alertRepository.save(alert);
    }

    public Alert update(Long id, AlertRequest request) {
        Alert alert = findById(id);
        applyRequest(alert, request);
        return alertRepository.save(alert);
    }

    public void delete(Long id) {
        alertRepository.delete(findById(id));
    }

    private void applyRequest(Alert alert, AlertRequest request) {
        Service service = serviceService.findById(request.serviceId());
        alert.setService(service);
        alert.setMetricName(request.metricName());
        alert.setThreshold(request.threshold());
        alert.setComparison(request.comparison());
        alert.setEnabled(request.enabled());
    }
}
