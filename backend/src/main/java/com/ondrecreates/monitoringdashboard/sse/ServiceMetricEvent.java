package com.ondrecreates.monitoringdashboard.sse;

import java.time.Instant;

/** SSE payload pushed to the frontend whenever the scheduler collects a fresh metric. */
public record ServiceMetricEvent(
        Long serviceId, String serviceName, String metricName, double value, Instant recordedAt) {}
