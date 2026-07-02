package com.ondrecreates.monitoringdashboard.sse;

import java.time.Instant;

/** SSE payload pushed on the `alert` event whenever an AlertEvent is triggered or resolved. */
public record AlertEventNotification(
        Long alertId,
        Long serviceId,
        String serviceName,
        String metricName,
        double triggeringValue,
        String status,
        Instant timestamp) {}
