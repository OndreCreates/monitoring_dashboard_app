package com.ondrecreates.monitoringdashboard.service;

import com.ondrecreates.monitoringdashboard.domain.AlertEvent;
import com.ondrecreates.monitoringdashboard.repository.AlertEventRepository;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class AlertEventService {

    private final AlertEventRepository alertEventRepository;

    public AlertEventService(AlertEventRepository alertEventRepository) {
        this.alertEventRepository = alertEventRepository;
    }

    public List<AlertEvent> findByAlert(Long alertId) {
        return alertEventRepository.findByAlertIdOrderByTriggeredAtDesc(alertId);
    }
}
