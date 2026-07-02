package com.ondrecreates.monitoringdashboard.api.mapper;

import com.ondrecreates.monitoringdashboard.api.dto.ServiceResponse;
import com.ondrecreates.monitoringdashboard.domain.Service;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ServiceMapper {

    ServiceResponse toResponse(Service service);
}
