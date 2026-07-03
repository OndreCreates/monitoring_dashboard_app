package com.ondrecreates.monitoringdashboard.api.dto;

/** {@code percentage} is null when there are no health_status samples in the window yet. */
public record UptimeResponse(Double percentage, int days) {}
