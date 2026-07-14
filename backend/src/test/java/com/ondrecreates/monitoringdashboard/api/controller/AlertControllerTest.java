package com.ondrecreates.monitoringdashboard.api.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ondrecreates.monitoringdashboard.api.dto.AlertRequest;
import com.ondrecreates.monitoringdashboard.api.dto.AlertResponse;
import com.ondrecreates.monitoringdashboard.api.mapper.AlertMapper;
import com.ondrecreates.monitoringdashboard.domain.Alert;
import com.ondrecreates.monitoringdashboard.domain.AlertComparison;
import com.ondrecreates.monitoringdashboard.exception.ResourceNotFoundException;
import com.ondrecreates.monitoringdashboard.service.AlertService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** HTTP-layer tests: status codes, validation, and error-body shape — business logic
 * itself (AlertService, evaluation) is exercised elsewhere and mocked out here. */
@WebMvcTest(AlertController.class)
class AlertControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AlertService alertService;

    @MockBean
    private AlertMapper alertMapper;

    @Test
    void postWithMissingServiceIdReturns400() throws Exception {
        // serviceId omitted (null) — @NotNull on AlertRequest.serviceId
        String body =
                """
                {"metricName":"cpu_usage","threshold":80,"comparison":"GREATER_THAN","enabled":true}
                """;

        mockMvc.perform(post("/api/v1/alerts").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void postWithValidBodyReturns201() throws Exception {
        AlertRequest request = new AlertRequest(1L, "cpu_usage", 80.0, AlertComparison.GREATER_THAN, true);
        Alert saved = new Alert();
        saved.setId(1L);
        when(alertService.create(any(AlertRequest.class))).thenReturn(saved);
        when(alertMapper.toResponse(saved))
                .thenReturn(new AlertResponse(1L, 1L, "cpu_usage", 80.0, AlertComparison.GREATER_THAN, true));

        mockMvc.perform(post("/api/v1/alerts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.metricName").value("cpu_usage"));
    }

    @Test
    void deleteOfUnknownAlertReturns404WithStructuredBody() throws Exception {
        org.mockito.Mockito.doThrow(new ResourceNotFoundException("Alert 99 not found"))
                .when(alertService)
                .delete(99L);

        mockMvc.perform(delete("/api/v1/alerts/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Alert 99 not found"));
    }
}
