package com.ondrecreates.monitoringdashboard.domain;

/** What kind of notable moment an {@link Event} records. */
public enum EventType {
    SERVICE_REGISTERED,
    HEALTH_UP,
    HEALTH_DOWN,
    ALERT_TRIGGERED,
    ALERT_RESOLVED
}
