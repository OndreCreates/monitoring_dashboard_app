package com.ondrecreates.monitoringdashboard.api.controller;

import com.ondrecreates.monitoringdashboard.api.dto.MetricResponse;
import com.ondrecreates.monitoringdashboard.api.mapper.MetricMapper;
import com.ondrecreates.monitoringdashboard.service.MetricService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/services/{serviceId}/metrics")
public class MetricController {

    private final MetricService metricService;
    private final MetricMapper metricMapper;

    public MetricController(MetricService metricService, MetricMapper metricMapper) {
        this.metricService = metricService;
        this.metricMapper = metricMapper;
    }

    @GetMapping
    public List<MetricResponse> findByService(@PathVariable Long serviceId) {
        return metricService.findByService(serviceId).stream().map(metricMapper::toResponse).toList();
    }
}
