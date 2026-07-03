package com.ondrecreates.monitoringdashboard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ondrecreates.monitoringdashboard.api.dto.ServiceRequest;
import com.ondrecreates.monitoringdashboard.domain.Service;
import com.ondrecreates.monitoringdashboard.exception.ResourceNotFoundException;
import com.ondrecreates.monitoringdashboard.repository.ServiceRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ServiceServiceTest {

    @Mock
    ServiceRepository serviceRepository;

    @Mock
    EventService eventService;

    ServiceService serviceService;

    @BeforeEach
    void setUp() {
        serviceService = new ServiceService(serviceRepository, eventService);
    }

    @Test
    void createSavesServiceAndRecordsRegistrationEvent() {
        ServiceRequest request =
                new ServiceRequest("payments-api", "http://payments-api:8080/actuator/health", List.of("production"));
        when(serviceRepository.save(any(Service.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Service created = serviceService.create(request);

        assertThat(created.getName()).isEqualTo("payments-api");
        assertThat(created.getUrl()).isEqualTo("http://payments-api:8080/actuator/health");
        verify(eventService).recordServiceRegistered(created);
    }

    @Test
    void findByIdThrowsWhenServiceDoesNotExist() {
        when(serviceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> serviceService.findById(99L)).isInstanceOf(ResourceNotFoundException.class);
    }
}
