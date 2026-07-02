package com.ondrecreates.monitoringdashboard.api.controller;

import com.ondrecreates.monitoringdashboard.api.dto.AlertEventResponse;
import com.ondrecreates.monitoringdashboard.api.mapper.AlertEventMapper;
import com.ondrecreates.monitoringdashboard.service.AlertEventService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/alerts/{alertId}/events")
public class AlertEventController {

    private final AlertEventService alertEventService;
    private final AlertEventMapper alertEventMapper;

    public AlertEventController(AlertEventService alertEventService, AlertEventMapper alertEventMapper) {
        this.alertEventService = alertEventService;
        this.alertEventMapper = alertEventMapper;
    }

    @GetMapping
    public List<AlertEventResponse> findByAlert(@PathVariable Long alertId) {
        return alertEventService.findByAlert(alertId).stream().map(alertEventMapper::toResponse).toList();
    }
}
