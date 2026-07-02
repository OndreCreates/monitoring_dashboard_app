package com.ondrecreates.monitoringdashboard.api.dto;

import java.time.Instant;

public record MetricResponse(Long id, String name, double value, Instant recordedAt) {}
