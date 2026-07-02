import { apiClient } from "@/api/client";
import type { EventResponse } from "@/api/types";

export function fetchRecentEvents() {
  return apiClient.get<EventResponse[]>("/api/v1/events");
}

export function fetchServiceEvents(serviceId: number) {
  return apiClient.get<EventResponse[]>(`/api/v1/services/${serviceId}/events`);
}
