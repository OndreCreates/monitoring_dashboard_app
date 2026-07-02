package com.ondrecreates.monitoringdashboard.repository;

import com.ondrecreates.monitoringdashboard.domain.AlertEvent;
import com.ondrecreates.monitoringdashboard.domain.AlertEventStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertEventRepository extends JpaRepository<AlertEvent, Long> {

    List<AlertEvent> findByAlertIdOrderByTriggeredAtDesc(Long alertId);

    Optional<AlertEvent> findFirstByAlertIdAndStatusOrderByTriggeredAtDesc(Long alertId, AlertEventStatus status);
}
