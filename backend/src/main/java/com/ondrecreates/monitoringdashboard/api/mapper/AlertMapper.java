package com.ondrecreates.monitoringdashboard.api.mapper;

import com.ondrecreates.monitoringdashboard.api.dto.AlertResponse;
import com.ondrecreates.monitoringdashboard.domain.Alert;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AlertMapper {

    @Mapping(target = "serviceId", source = "service.id")
    AlertResponse toResponse(Alert alert);
}
