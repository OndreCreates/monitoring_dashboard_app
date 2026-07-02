package com.ondrecreates.monitoringdashboard.api.controller;

import com.ondrecreates.monitoringdashboard.api.dto.EventResponse;
import com.ondrecreates.monitoringdashboard.api.mapper.EventMapper;
import com.ondrecreates.monitoringdashboard.repository.EventRepository;
import java.util.List;
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
    public List<EventResponse> findRecent() {
        return eventRepository.findTop50ByOrderByOccurredAtDesc().stream()
                .map(eventMapper::toResponse)
                .toList();
    }

    @GetMapping("/api/v1/services/{serviceId}/events")
    public List<EventResponse> findByService(@PathVariable Long serviceId) {
        return eventRepository.findByServiceIdOrderByOccurredAtDesc(serviceId).stream()
                .map(eventMapper::toResponse)
                .toList();
    }
}
