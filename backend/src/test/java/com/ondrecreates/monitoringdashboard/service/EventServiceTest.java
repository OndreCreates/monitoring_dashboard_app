package com.ondrecreates.monitoringdashboard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ondrecreates.monitoringdashboard.domain.Event;
import com.ondrecreates.monitoringdashboard.domain.EventType;
import com.ondrecreates.monitoringdashboard.domain.Service;
import com.ondrecreates.monitoringdashboard.repository.EventRepository;
import com.ondrecreates.monitoringdashboard.sse.ServiceStatusBroadcaster;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    EventRepository eventRepository;

    @Mock
    ServiceStatusBroadcaster broadcaster;

    EventService eventService;
    Service service;

    @BeforeEach
    void setUp() {
        eventService = new EventService(eventRepository, broadcaster);
        service = new Service();
        service.setId(1L);
        service.setName("demo-service-a");
    }

    @Test
    void firstHealthCheckEverDoesNotRecordATransitionEvent() {
        // No prior state for this service — nothing to compare against, so no HEALTH_UP/DOWN yet.
        eventService.recordHealthStatus(service, true);

        verify(eventRepository, never()).save(any());
    }

    @Test
    void repeatedSameStatusDoesNotRecordDuplicateEvents() {
        eventService.recordHealthStatus(service, true);
        eventService.recordHealthStatus(service, true);
        eventService.recordHealthStatus(service, true);

        verify(eventRepository, never()).save(any());
    }

    @Test
    void transitionFromHealthyToUnhealthyRecordsHealthDown() {
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        eventService.recordHealthStatus(service, true);
        eventService.recordHealthStatus(service, false);

        ArgumentCaptor<Event> captor = ArgumentCaptor.forClass(Event.class);
        verify(eventRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getType()).isEqualTo(EventType.HEALTH_DOWN);
    }

    @Test
    void transitionFromUnhealthyToHealthyRecordsHealthUp() {
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        eventService.recordHealthStatus(service, false);
        eventService.recordHealthStatus(service, true);

        ArgumentCaptor<Event> captor = ArgumentCaptor.forClass(Event.class);
        verify(eventRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getType()).isEqualTo(EventType.HEALTH_UP);
    }

    @Test
    void recordServiceRegisteredSavesEventWithServiceName() {
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        eventService.recordServiceRegistered(service);

        ArgumentCaptor<Event> captor = ArgumentCaptor.forClass(Event.class);
        verify(eventRepository).save(captor.capture());
        assertThat(captor.getValue().getType()).isEqualTo(EventType.SERVICE_REGISTERED);
        assertThat(captor.getValue().getMessage()).contains("demo-service-a");
    }
}
