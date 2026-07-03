package com.ondrecreates.monitoringdashboard.api.controller;

import com.ondrecreates.monitoringdashboard.api.dto.SystemInfoResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/system-info")
public class SystemInfoController {

    private final long pollIntervalMs;
    private final int metricsRetentionDays;
    private final int eventsRetentionDays;

    public SystemInfoController(
            @Value("${monitoring.poll-interval-ms}") long pollIntervalMs,
            @Value("${retention.metrics-days}") int metricsRetentionDays,
            @Value("${retention.events-days}") int eventsRetentionDays) {
        this.pollIntervalMs = pollIntervalMs;
        this.metricsRetentionDays = metricsRetentionDays;
        this.eventsRetentionDays = eventsRetentionDays;
    }

    @GetMapping
    public SystemInfoResponse get() {
        return new SystemInfoResponse(pollIntervalMs, metricsRetentionDays, eventsRetentionDays);
    }
}
