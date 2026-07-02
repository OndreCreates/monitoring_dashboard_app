package com.ondrecreates.monitoringdashboard.sse;

import com.ondrecreates.monitoringdashboard.domain.EventType;
import java.time.Instant;

/** SSE payload pushed on the `event` event whenever a new Event is recorded. */
public record EventNotification(
        Long id, Long serviceId, String serviceName, EventType type, String message, Instant occurredAt) {}
