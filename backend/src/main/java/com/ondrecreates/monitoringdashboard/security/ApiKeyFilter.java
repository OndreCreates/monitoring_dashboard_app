package com.ondrecreates.monitoringdashboard.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ondrecreates.monitoringdashboard.api.dto.ErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Optional API key gate for mutating requests (POST/PUT/DELETE under /api/**).
 * Disabled by default (API_KEY unset) to keep local/demo use frictionless — same
 * opt-in-via-env pattern as the webhook notifications (see application.yml).
 * GET stays open either way; read access isn't the sensitive part here.
 */
@Component
public class ApiKeyFilter extends OncePerRequestFilter {

    private static final Set<String> PROTECTED_METHODS = Set.of("POST", "PUT", "DELETE");
    private static final String HEADER_NAME = "X-API-Key";

    private final String configuredApiKey;
    private final ObjectMapper objectMapper;

    public ApiKeyFilter(@Value("${security.api-key:}") String configuredApiKey, ObjectMapper objectMapper) {
        this.configuredApiKey = configuredApiKey;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (requiresApiKey(request) && !configuredApiKey.equals(request.getHeader(HEADER_NAME))) {
            respondUnauthorized(response);
            return;
        }
        filterChain.doFilter(request, response);
    }

    private boolean requiresApiKey(HttpServletRequest request) {
        return !configuredApiKey.isBlank()
                && request.getRequestURI().startsWith("/api/")
                && PROTECTED_METHODS.contains(request.getMethod());
    }

    private void respondUnauthorized(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        // Explicit UTF-8 — response.getWriter() otherwise falls back to the servlet
        // container's default (ISO-8859-1), which mangles Czech diacritics.
        response.setCharacterEncoding("UTF-8");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ErrorResponse body = new ErrorResponse(
                Instant.now(), HttpStatus.UNAUTHORIZED.value(), "Chybí nebo neplatný " + HEADER_NAME + " header.");
        objectMapper.writeValue(response.getWriter(), body);
    }
}
