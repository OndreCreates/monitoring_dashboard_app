package com.ondrecreates.monitoringdashboard.repository;

import com.ondrecreates.monitoringdashboard.domain.AlertEvent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertEventRepository extends JpaRepository<AlertEvent, Long> {

    List<AlertEvent> findByAlertIdOrderByTriggeredAtDesc(Long alertId);
}
