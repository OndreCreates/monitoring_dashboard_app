package com.ondrecreates.monitoringdashboard.exception;

import static org.assertj.core.api.Assertions.assertThat;

import com.ondrecreates.monitoringdashboard.api.dto.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void notFoundExceptionMapsTo404WithMessage() {
        ResponseEntity<ErrorResponse> response = handler.handleNotFound(new ResourceNotFoundException("Service 1 not found"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().message()).isEqualTo("Service 1 not found");
    }

    @Test
    void dataIntegrityViolationMapsTo409NotAGeneric500() {
        ResponseEntity<ErrorResponse> response =
                handler.handleConflict(new DataIntegrityViolationException("duplicate key value violates unique constraint"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody().message()).contains("existuje");
    }

    @Test
    void unexpectedExceptionMapsTo500WithGenericMessage() {
        ResponseEntity<ErrorResponse> response = handler.handleUnexpected(new RuntimeException("boom"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().message()).isEqualTo("Unexpected error");
    }
}
