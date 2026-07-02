package com.ondrecreates.monitoringdashboard.api.mapper;

import com.ondrecreates.monitoringdashboard.api.dto.MetricResponse;
import com.ondrecreates.monitoringdashboard.domain.Metric;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MetricMapper {

    MetricResponse toResponse(Metric metric);
}
