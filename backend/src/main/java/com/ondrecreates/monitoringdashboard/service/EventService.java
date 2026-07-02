package com.ondrecreates.monitoringdashboard.service;

import com.ondrecreates.monitoringdashboard.domain.Alert;
import com.ondrecreates.monitoringdashboard.domain.Event;
import com.ondrecreates.monitoringdashboard.domain.EventType;
import com.ondrecreates.monitoringdashboard.domain.Service;
import com.ondrecreates.monitoringdashboard.repository.EventRepository;
import com.ondrecreates.monitoringdashboard.sse.EventNotification;
import com.ondrecreates.monitoringdashboard.sse.ServiceStatusBroadcaster;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Records a curated, human-readable timeline of notable moments — not raw log tailing,
 * see docs/architecture.md. Health transitions are detected from an in-memory last-known-state
 * map (reset on restart), not a DB lookup, to keep the hot polling path cheap.
 */
@Component
public class EventService {

    private final EventRepository eventRepository;
    private final ServiceStatusBroadcaster broadcaster;
    private final Map<Long, Boolean> lastKnownHealth = new ConcurrentHashMap<>();

    public EventService(EventRepository eventRepository, ServiceStatusBroadcaster broadcaster) {
        this.eventRepository = eventRepository;
        this.broadcaster = broadcaster;
    }

    public void recordServiceRegistered(Service service) {
        save(service, EventType.SERVICE_REGISTERED, "Služba '" + service.getName() + "' byla zaregistrována.");
    }

    public void recordHealthStatus(Service service, boolean healthy) {
        Boolean previous = lastKnownHealth.put(service.getId(), healthy);
        if (previous == null || previous == healthy) {
            return;
        }
        if (healthy) {
            save(service, EventType.HEALTH_UP, "Služba '" + service.getName() + "' je znovu dostupná.");
        } else {
            save(service, EventType.HEALTH_DOWN, "Služba '" + service.getName() + "' přestala odpovídat.");
        }
    }

    public void recordAlertTriggered(Service service, Alert alert, double value) {
        save(
                service,
                EventType.ALERT_TRIGGERED,
                "Alert '" + alert.getMetricName() + "' spuštěn (hodnota " + value + ").");
    }

    public void recordAlertResolved(Service service, Alert alert) {
        save(service, EventType.ALERT_RESOLVED, "Alert '" + alert.getMetricName() + "' vyřešen.");
    }

    private void save(Service service, EventType type, String message) {
        Event event = new Event();
        event.setService(service);
        event.setType(type);
        event.setMessage(message);
        eventRepository.save(event);
        broadcaster.broadcastEvent(new EventNotification(
                event.getId(), service.getId(), service.getName(), type, message, event.getOccurredAt()));
    }
}
