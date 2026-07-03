package com.ondrecreates.monitoringdashboard.repository;

import com.ondrecreates.monitoringdashboard.domain.Metric;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MetricRepository extends JpaRepository<Metric, Long> {

    Page<Metric> findByServiceId(Long serviceId, Pageable pageable);

    // Filtering by name happens in the query, before pagination — otherwise
    // paging the mixed stream of all metric types would starve a single-type
    // chart (7 metric types per poll cycle means size=20 mixed ≈ 3 of any one type).
    Page<Metric> findByServiceIdAndName(Long serviceId, String name, Pageable pageable);

    long deleteByRecordedAtBefore(Instant cutoff);
}
