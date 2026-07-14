package com.ondrecreates.monitoringdashboard.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info =
                @Info(
                        title = "Monitoring Dashboard API",
                        version = "v1",
                        description =
                                "Pull-model monitoring platform — registruje služby, sbírá jejich metriky, "
                                        + "vyhodnocuje alerty a zaznamenává významné události. Viz docs/architecture.md."))
// Documents ApiKeyFilter: POST/PUT/DELETE need X-API-Key only if the backend was
// started with API_KEY set (see application.yml) — GET stays unauthenticated either way.
@SecurityScheme(name = "apiKey", type = SecuritySchemeType.APIKEY, paramName = "X-API-Key", in = SecuritySchemeIn.HEADER)
public class OpenApiConfig {}
