package com.ondrecreates.monitoringdashboard.repository;

import com.ondrecreates.monitoringdashboard.domain.Metric;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MetricRepository extends JpaRepository<Metric, Long> {

    Page<Metric> findByServiceId(Long serviceId, Pageable pageable);

    // Filtering by name happens in the query, before pagination — otherwise
    // paging the mixed stream of all metric types would starve a single-type
    // chart (7 metric types per poll cycle means size=20 mixed ≈ 3 of any one type).
    Page<Metric> findByServiceIdAndName(Long serviceId, String name, Pageable pageable);

    long deleteByRecordedAtBefore(Instant cutoff);

    // health_status is recorded as 0.0/1.0, so its average over a time window
    // IS the uptime fraction — no need to fetch rows and compute client-side.
    @Query("SELECT AVG(m.value) FROM Metric m "
            + "WHERE m.service.id = :serviceId AND m.name = :name AND m.recordedAt >= :since")
    Optional<Double> averageValueSince(
            @Param("serviceId") Long serviceId, @Param("name") String name, @Param("since") Instant since);
}
