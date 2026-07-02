package com.ondrecreates.monitoringdashboard.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.ondrecreates.monitoringdashboard.domain.Service;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** Real Postgres + Flyway migrations, not an in-memory swap — proves the schema actually works. */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class ServiceRepositoryIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    ServiceRepository serviceRepository;

    @Test
    void savesAndFindsServiceByName() {
        Service service = new Service();
        service.setName("payments-api");
        service.setUrl("http://payments-api:8080/actuator/health");
        serviceRepository.save(service);

        assertThat(serviceRepository.findByName("payments-api")).isPresent();
    }

    @Test
    void findByNameReturnsEmptyForUnknownService() {
        assertThat(serviceRepository.findByName("does-not-exist")).isEmpty();
    }
}
