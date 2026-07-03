package com.ondrecreates.monitoringdashboard.api.dto;

import java.time.Instant;
import java.util.List;

public record ServiceResponse(Long id, String name, String url, Instant createdAt, List<String> tags) {}
