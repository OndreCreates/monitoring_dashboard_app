package com.ondrecreates.monitoringdashboard.repository;

import com.ondrecreates.monitoringdashboard.domain.Event;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {

    // findAll(Pageable) for the "recent events across all services" case is
    // already inherited from JpaRepository — no custom method needed for it.
    Page<Event> findByServiceId(Long serviceId, Pageable pageable);

    long deleteByOccurredAtBefore(Instant cutoff);
}
