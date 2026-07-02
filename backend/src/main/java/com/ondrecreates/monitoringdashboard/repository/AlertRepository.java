package com.ondrecreates.monitoringdashboard.repository;

import com.ondrecreates.monitoringdashboard.domain.Alert;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByServiceId(Long serviceId);

    List<Alert> findByEnabledTrue();

    List<Alert> findByServiceIdAndMetricNameAndEnabledTrue(Long serviceId, String metricName);
}
