package com.ondrecreates.monitoringdashboard.api.dto;

import com.ondrecreates.monitoringdashboard.domain.EventType;
import java.time.Instant;

public record EventResponse(
        Long id, Long serviceId, String serviceName, EventType type, String message, Instant occurredAt) {}
