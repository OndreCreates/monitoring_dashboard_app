import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/api/client";
import type { AlertEventNotification, EventResponse, ServiceMetricEvent } from "@/api/types";

const MAX_EVENTS = 20;

/**
 * One shared EventSource connection to GET /api/v1/events/services, fanned out into the
 * three event types the backend pushes (`metric`, `alert`, `event`) — avoids opening a
 * separate SSE connection per consumer.
 */
export function useLiveEvents() {
  const [metricEvents, setMetricEvents] = useState<ServiceMetricEvent[]>([]);
  const [alertEvents, setAlertEvents] = useState<AlertEventNotification[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<EventResponse[]>([]);

  useEffect(() => {
    const source = new EventSource(`${API_BASE_URL}/api/v1/events/services`);

    source.addEventListener("metric", (event) => {
      const data = JSON.parse((event as MessageEvent).data) as ServiceMetricEvent;
      setMetricEvents((prev) => [data, ...prev].slice(0, MAX_EVENTS));
    });

    source.addEventListener("alert", (event) => {
      const data = JSON.parse((event as MessageEvent).data) as AlertEventNotification;
      setAlertEvents((prev) => [data, ...prev].slice(0, MAX_EVENTS));
    });

    source.addEventListener("event", (event) => {
      const data = JSON.parse((event as MessageEvent).data) as EventResponse;
      setTimelineEvents((prev) => [data, ...prev].slice(0, MAX_EVENTS));
    });

    return () => {
      source.close();
    };
  }, []);

  return { metricEvents, alertEvents, timelineEvents };
}
