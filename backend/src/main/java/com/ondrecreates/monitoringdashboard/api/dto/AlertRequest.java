package com.ondrecreates.monitoringdashboard.api.dto;

import com.ondrecreates.monitoringdashboard.domain.AlertComparison;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AlertRequest(
        @NotNull Long serviceId,
        @NotBlank String metricName,
        @NotNull Double threshold,
        @NotNull AlertComparison comparison,
        boolean enabled) {}
