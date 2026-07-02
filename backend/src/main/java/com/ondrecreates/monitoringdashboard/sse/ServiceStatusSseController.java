package com.ondrecreates.monitoringdashboard.sse;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
public class ServiceStatusSseController {

    private final ServiceStatusBroadcaster broadcaster;

    public ServiceStatusSseController(ServiceStatusBroadcaster broadcaster) {
        this.broadcaster = broadcaster;
    }

    @GetMapping(path = "/api/v1/events/services", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamServiceMetrics() {
        return broadcaster.subscribe();
    }
}
