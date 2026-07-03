package com.ondrecreates.monitoringdashboard.api.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ServiceRequest(@NotBlank String name, @NotBlank String url, List<String> tags) {

    public ServiceRequest {
        tags = tags == null ? List.of() : tags;
    }
}
