package com.ondrecreates.monitoringdashboard.api.dto;

import com.ondrecreates.monitoringdashboard.domain.AlertEventStatus;
import java.time.Instant;

public record AlertEventResponse(
        Long id, Long alertId, double triggeringValue, AlertEventStatus status, Instant triggeredAt, Instant resolvedAt) {}
