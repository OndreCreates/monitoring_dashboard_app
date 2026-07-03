package com.ondrecreates.monitoringdashboard.api.dto;

/** Read-only snapshot of active backend config — shown in Settings so it can't drift from reality. */
public record SystemInfoResponse(long pollIntervalMs, int metricsRetentionDays, int eventsRetentionDays) {}
