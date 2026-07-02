package com.ondrecreates.monitoringdashboard.api.mapper;

import com.ondrecreates.monitoringdashboard.api.dto.AlertEventResponse;
import com.ondrecreates.monitoringdashboard.domain.AlertEvent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AlertEventMapper {

    @Mapping(target = "alertId", source = "alert.id")
    AlertEventResponse toResponse(AlertEvent alertEvent);
}
