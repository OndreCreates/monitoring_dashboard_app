package com.ondrecreates.monitoringdashboard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ondrecreates.monitoringdashboard.domain.Metric;
import com.ondrecreates.monitoringdashboard.domain.Service;
import com.ondrecreates.monitoringdashboard.repository.MetricRepository;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class MetricServiceTest {

    @Mock
    MetricRepository metricRepository;

    MetricService metricService;

    @BeforeEach
    void setUp() {
        metricService = new MetricService(metricRepository);
    }

    @Test
    void findByServiceWithoutNameQueriesAllMetricsForService() {
        Pageable pageable = Pageable.unpaged();
        Page<Metric> page = new PageImpl<>(java.util.List.of());
        when(metricRepository.findByServiceId(1L, pageable)).thenReturn(page);

        metricService.findByService(1L, null, pageable);

        verify(metricRepository).findByServiceId(1L, pageable);
        verify(metricRepository, org.mockito.Mockito.never()).findByServiceIdAndName(any(), any(), any());
    }

    @Test
    void findByServiceWithNameFiltersByMetricName() {
        Pageable pageable = Pageable.unpaged();
        Page<Metric> page = new PageImpl<>(java.util.List.of());
        when(metricRepository.findByServiceIdAndName(1L, "response_time_ms", pageable)).thenReturn(page);

        metricService.findByService(1L, "response_time_ms", pageable);

        verify(metricRepository).findByServiceIdAndName(1L, "response_time_ms", pageable);
    }

    @Test
    void calculateUptimePercentageConvertsFractionToPercentage() {
        when(metricRepository.averageValueSince(eq(1L), eq("health_status"), any(Instant.class)))
                .thenReturn(Optional.of(0.992));

        Double uptime = metricService.calculateUptimePercentage(1L, 7);

        assertThat(uptime).isEqualTo(99.2);
    }

    @Test
    void calculateUptimePercentageReturnsNullWhenNoSamplesInWindow() {
        when(metricRepository.averageValueSince(eq(1L), eq("health_status"), any(Instant.class)))
                .thenReturn(Optional.empty());

        Double uptime = metricService.calculateUptimePercentage(1L, 7);

        assertThat(uptime).isNull();
    }

    @Test
    void recordSavesMetricWithServiceNameAndValue() {
        Service service = new Service();
        service.setId(1L);
        when(metricRepository.save(any(Metric.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Metric metric = metricService.record(service, "cpu_usage", 0.42);

        assertThat(metric.getService()).isEqualTo(service);
        assertThat(metric.getName()).isEqualTo("cpu_usage");
        assertThat(metric.getValue()).isEqualTo(0.42);
    }
}
