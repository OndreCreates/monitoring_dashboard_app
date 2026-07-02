package com.ondrecreates.monitoringdashboard.sse;

import com.ondrecreates.monitoringdashboard.domain.Metric;
import com.ondrecreates.monitoringdashboard.domain.Service;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/** Keeps track of connected SSE clients and pushes metric updates to all of them. */
@Component
public class ServiceStatusBroadcaster {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(ex -> emitters.remove(emitter));
        return emitter;
    }

    public void broadcastMetric(Service service, Metric metric) {
        ServiceMetricEvent event = new ServiceMetricEvent(
                service.getId(), service.getName(), metric.getName(), metric.getValue(), metric.getRecordedAt());
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("metric").data(event));
            } catch (Exception ex) {
                emitters.remove(emitter);
            }
        }
    }

    public void broadcastAlertEvent(AlertEventNotification notification) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("alert").data(notification));
            } catch (Exception ex) {
                emitters.remove(emitter);
            }
        }
    }

    public void broadcastEvent(EventNotification notification) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("event").data(notification));
            } catch (Exception ex) {
                emitters.remove(emitter);
            }
        }
    }
}
