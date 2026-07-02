import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/api/client";
import type { ServiceMetricEvent } from "@/api/types";

const MAX_EVENTS = 20;

/** Subscribes to GET /api/v1/events/services and keeps the last N received metric events. */
export function useServiceMetricsStream() {
  const [events, setEvents] = useState<ServiceMetricEvent[]>([]);

  useEffect(() => {
    const source = new EventSource(`${API_BASE_URL}/api/v1/events/services`);

    source.addEventListener("metric", (event) => {
      const data = JSON.parse((event as MessageEvent).data) as ServiceMetricEvent;
      setEvents((prev) => [data, ...prev].slice(0, MAX_EVENTS));
    });

    return () => {
      source.close();
    };
  }, []);

  return events;
}
