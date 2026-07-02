package com.ondrecreates.monitoringdashboard.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Concrete occurrence of an {@link Alert} rule being triggered (and later resolved). */
@Entity
@Table(name = "alert_events")
@Getter
@Setter
@NoArgsConstructor
public class AlertEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "alert_id", nullable = false)
    private Alert alert;

    @Column(name = "triggering_value", nullable = false)
    private double triggeringValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertEventStatus status = AlertEventStatus.TRIGGERED;

    @Column(name = "triggered_at", nullable = false)
    private Instant triggeredAt = Instant.now();

    @Column(name = "resolved_at")
    private Instant resolvedAt;
}
