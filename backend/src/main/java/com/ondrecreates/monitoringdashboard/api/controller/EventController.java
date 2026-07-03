package com.ondrecreates.monitoringdashboard.api.controller;

import com.ondrecreates.monitoringdashboard.api.dto.EventResponse;
import com.ondrecreates.monitoringdashboard.api.dto.PageResponse;
import com.ondrecreates.monitoringdashboard.api.mapper.EventMapper;
import com.ondrecreates.monitoringdashboard.repository.EventRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EventController {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;

    public EventController(EventRepository eventRepository, EventMapper eventMapper) {
        this.eventRepository = eventRepository;
        this.eventMapper = eventMapper;
    }

    @GetMapping("/api/v1/events")
    public PageResponse<EventResponse> findRecent(
            @PageableDefault(size = 50, sort = "occurredAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponse.of(eventRepository.findAll(pageable).map(eventMapper::toResponse));
    }

    @GetMapping("/api/v1/services/{serviceId}/events")
    public PageResponse<EventResponse> findByService(
            @PathVariable Long serviceId,
            @PageableDefault(size = 50, sort = "occurredAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponse.of(
                eventRepository.findByServiceId(serviceId, pageable).map(eventMapper::toResponse));
    }
}
