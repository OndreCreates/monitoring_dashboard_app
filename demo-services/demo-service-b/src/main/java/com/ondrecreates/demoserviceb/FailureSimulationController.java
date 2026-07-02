package com.ondrecreates.demoserviceb;

import java.time.Duration;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FailureSimulationController {

    private static final Duration FAILURE_DURATION = Duration.ofSeconds(60);

    private final FailureSimulationHealthIndicator healthIndicator;

    public FailureSimulationController(FailureSimulationHealthIndicator healthIndicator) {
        this.healthIndicator = healthIndicator;
    }

    @PostMapping("/simulate-failure")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void simulateFailure() {
        healthIndicator.simulateFailure(FAILURE_DURATION);
    }
}
