package com.ondrecreates.demoserviceb;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * Contributes to /actuator/health. Self-expiring: once {@link #simulateFailure} sets a
 * deadline, every health check until that deadline reports DOWN; no scheduled reset needed.
 */
@Component
public class FailureSimulationHealthIndicator implements HealthIndicator {

    private final AtomicReference<Instant> failUntil = new AtomicReference<>();

    @Override
    public Health health() {
        Instant until = failUntil.get();
        if (until != null && Instant.now().isBefore(until)) {
            return Health.down().withDetail("reason", "simulated failure").build();
        }
        return Health.up().build();
    }

    public void simulateFailure(Duration duration) {
        failUntil.set(Instant.now().plus(duration));
    }
}
