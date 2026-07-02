package com.ondrecreates.monitoringdashboard.api.dto;

import jakarta.validation.constraints.NotBlank;

public record ServiceRequest(@NotBlank String name, @NotBlank String url) {}
