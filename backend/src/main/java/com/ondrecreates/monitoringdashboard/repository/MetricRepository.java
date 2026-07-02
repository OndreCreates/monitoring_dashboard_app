package com.ondrecreates.monitoringdashboard.repository;

import com.ondrecreates.monitoringdashboard.domain.Metric;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MetricRepository extends JpaRepository<Metric, Long> {

    List<Metric> findByServiceIdOrderByRecordedAtDesc(Long serviceId);
}
