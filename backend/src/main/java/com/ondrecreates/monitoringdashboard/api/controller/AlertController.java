package com.ondrecreates.monitoringdashboard.api.controller;

import com.ondrecreates.monitoringdashboard.api.dto.AlertRequest;
import com.ondrecreates.monitoringdashboard.api.dto.AlertResponse;
import com.ondrecreates.monitoringdashboard.api.mapper.AlertMapper;
import com.ondrecreates.monitoringdashboard.service.AlertService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AlertController {

    private final AlertService alertService;
    private final AlertMapper alertMapper;

    public AlertController(AlertService alertService, AlertMapper alertMapper) {
        this.alertService = alertService;
        this.alertMapper = alertMapper;
    }

    @GetMapping("/api/v1/alerts")
    public List<AlertResponse> findAll() {
        return alertService.findAll().stream().map(alertMapper::toResponse).toList();
    }

    @GetMapping("/api/v1/services/{serviceId}/alerts")
    public List<AlertResponse> findByService(@PathVariable Long serviceId) {
        return alertService.findByService(serviceId).stream().map(alertMapper::toResponse).toList();
    }

    @GetMapping("/api/v1/alerts/{id}")
    public AlertResponse findById(@PathVariable Long id) {
        return alertMapper.toResponse(alertService.findById(id));
    }

    @PostMapping("/api/v1/alerts")
    @ResponseStatus(HttpStatus.CREATED)
    public AlertResponse create(@Valid @RequestBody AlertRequest request) {
        return alertMapper.toResponse(alertService.create(request));
    }

    @PutMapping("/api/v1/alerts/{id}")
    public AlertResponse update(@PathVariable Long id, @Valid @RequestBody AlertRequest request) {
        return alertMapper.toResponse(alertService.update(id, request));
    }

    @DeleteMapping("/api/v1/alerts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        alertService.delete(id);
    }
}
