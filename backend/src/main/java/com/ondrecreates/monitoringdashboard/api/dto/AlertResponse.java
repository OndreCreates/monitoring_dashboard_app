package com.ondrecreates.monitoringdashboard.api.dto;

import com.ondrecreates.monitoringdashboard.domain.AlertComparison;

public record AlertResponse(
        Long id, Long serviceId, String metricName, double threshold, AlertComparison comparison, boolean enabled) {}
