package com.ondrecreates.monitoringdashboard.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class ApiKeyFilterTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void withoutConfiguredKeyEveryRequestPassesThrough() throws Exception {
        ApiKeyFilter filter = new ApiKeyFilter("", objectMapper);
        MockHttpServletResponse response = new MockHttpServletResponse();
        boolean[] chainCalled = {false};

        filter.doFilter(
                new MockHttpServletRequest("POST", "/api/v1/services"), response, chain(chainCalled));

        assertThat(chainCalled[0]).isTrue();
    }

    @Test
    void getRequestsAreNeverProtectedEvenWithConfiguredKey() throws Exception {
        ApiKeyFilter filter = new ApiKeyFilter("secret", objectMapper);
        boolean[] chainCalled = {false};

        filter.doFilter(
                new MockHttpServletRequest("GET", "/api/v1/services"),
                new MockHttpServletResponse(),
                chain(chainCalled));

        assertThat(chainCalled[0]).isTrue();
    }

    @Test
    void postWithoutHeaderIsRejectedWith401() throws Exception {
        ApiKeyFilter filter = new ApiKeyFilter("secret", objectMapper);
        MockHttpServletResponse response = new MockHttpServletResponse();
        boolean[] chainCalled = {false};

        filter.doFilter(new MockHttpServletRequest("POST", "/api/v1/services"), response, chain(chainCalled));

        assertThat(chainCalled[0]).isFalse();
        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getCharacterEncoding()).isEqualToIgnoringCase("UTF-8");
        assertThat(response.getContentAsString()).contains("X-API-Key").contains("Chybí nebo neplatný");
    }

    @Test
    void postWithWrongHeaderIsRejectedWith401() throws Exception {
        ApiKeyFilter filter = new ApiKeyFilter("secret", objectMapper);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/services");
        request.addHeader("X-API-Key", "wrong");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, chain(new boolean[] {false}));

        assertThat(response.getStatus()).isEqualTo(401);
    }

    @Test
    void postWithCorrectHeaderPassesThrough() throws Exception {
        ApiKeyFilter filter = new ApiKeyFilter("secret", objectMapper);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/services");
        request.addHeader("X-API-Key", "secret");
        boolean[] chainCalled = {false};

        filter.doFilter(request, new MockHttpServletResponse(), chain(chainCalled));

        assertThat(chainCalled[0]).isTrue();
    }

    @Test
    void nonApiPathsAreNeverProtected() throws Exception {
        ApiKeyFilter filter = new ApiKeyFilter("secret", objectMapper);
        boolean[] chainCalled = {false};

        filter.doFilter(
                new MockHttpServletRequest("POST", "/actuator/health"),
                new MockHttpServletResponse(),
                chain(chainCalled));

        assertThat(chainCalled[0]).isTrue();
    }

    private static FilterChain chain(boolean[] calledFlag) {
        return (request, response) -> calledFlag[0] = true;
    }
}
