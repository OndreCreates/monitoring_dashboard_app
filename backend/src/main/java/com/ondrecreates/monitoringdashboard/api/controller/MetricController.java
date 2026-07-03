package com.ondrecreates.monitoringdashboard.api.controller;

import com.ondrecreates.monitoringdashboard.api.dto.MetricResponse;
import com.ondrecreates.monitoringdashboard.api.dto.PageResponse;
import com.ondrecreates.monitoringdashboard.api.mapper.MetricMapper;
import com.ondrecreates.monitoringdashboard.service.MetricService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public PageResponse<MetricResponse> findByService(
            @PathVariable Long serviceId,
            @RequestParam(required = false) String name,
            @PageableDefault(size = 20, sort = "recordedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponse.of(
                metricService.findByService(serviceId, name, pageable).map(metricMapper::toResponse));
    }
}
