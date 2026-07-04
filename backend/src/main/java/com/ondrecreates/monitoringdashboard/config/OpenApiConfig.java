package com.ondrecreates.monitoringdashboard.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
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
public class OpenApiConfig {}
