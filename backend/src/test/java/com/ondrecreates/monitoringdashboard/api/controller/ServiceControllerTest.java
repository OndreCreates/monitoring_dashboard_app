package com.ondrecreates.monitoringdashboard.api.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ondrecreates.monitoringdashboard.api.dto.ServiceRequest;
import com.ondrecreates.monitoringdashboard.api.dto.ServiceResponse;
import com.ondrecreates.monitoringdashboard.api.mapper.ServiceMapper;
import com.ondrecreates.monitoringdashboard.domain.Service;
import com.ondrecreates.monitoringdashboard.exception.ResourceNotFoundException;
import com.ondrecreates.monitoringdashboard.service.ServiceService;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** HTTP-layer tests: status codes, validation, and error-body shape — business logic
 * itself (ServiceService, mapping) is exercised elsewhere and mocked out here. */
@WebMvcTest(ServiceController.class)
class ServiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ServiceService serviceService;

    @MockBean
    private ServiceMapper serviceMapper;

    @Test
    void getAllReturnsMappedServicesAsJsonArray() throws Exception {
        Service service = new Service();
        service.setId(1L);
        when(serviceService.findAll()).thenReturn(List.of(service));
        when(serviceMapper.toResponse(service))
                .thenReturn(new ServiceResponse(1L, "demo-service-a", "http://x:8081/actuator/health", Instant.now(), List.of()));

        mockMvc.perform(get("/api/v1/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("demo-service-a"));
    }

    @Test
    void getByIdReturns404WithStructuredBodyWhenNotFound() throws Exception {
        when(serviceService.findById(99L)).thenThrow(new ResourceNotFoundException("Service 99 not found"));

        mockMvc.perform(get("/api/v1/services/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Service 99 not found"));
    }

    @Test
    void postWithBlankNameReturns400() throws Exception {
        ServiceRequest invalid = new ServiceRequest("", "http://x:8081/actuator/health", List.of());

        mockMvc.perform(post("/api/v1/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void postWithValidBodyReturns201WithLocationlessCreatedResource() throws Exception {
        ServiceRequest request = new ServiceRequest("demo-service-a", "http://x:8081/actuator/health", List.of());
        Service saved = new Service();
        saved.setId(1L);
        when(serviceService.create(any(ServiceRequest.class))).thenReturn(saved);
        when(serviceMapper.toResponse(saved))
                .thenReturn(new ServiceResponse(1L, "demo-service-a", "http://x:8081/actuator/health", Instant.now(), List.of()));

        mockMvc.perform(post("/api/v1/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void deleteReturns204NoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/services/1")).andExpect(status().isNoContent());
    }
}
