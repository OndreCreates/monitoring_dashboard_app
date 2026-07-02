package com.ondrecreates.monitoringdashboard.repository;

import com.ondrecreates.monitoringdashboard.domain.Event;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findTop50ByOrderByOccurredAtDesc();

    List<Event> findByServiceIdOrderByOccurredAtDesc(Long serviceId);
}
