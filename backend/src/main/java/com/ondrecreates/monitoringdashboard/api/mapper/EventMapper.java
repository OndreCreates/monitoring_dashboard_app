package com.ondrecreates.monitoringdashboard.api.mapper;

import com.ondrecreates.monitoringdashboard.api.dto.EventResponse;
import com.ondrecreates.monitoringdashboard.domain.Event;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EventMapper {

    @Mapping(target = "serviceId", source = "service.id")
    @Mapping(target = "serviceName", source = "service.name")
    EventResponse toResponse(Event event);
}
