import { apiClient } from "@/api/client";
import type { EventResponse, PageResponse } from "@/api/types";

export function fetchRecentEvents() {
  return apiClient.get<PageResponse<EventResponse>>("/api/v1/events").then((page) => page.content);
}

export function fetchServiceEvents(serviceId: number) {
  return apiClient
    .get<PageResponse<EventResponse>>(`/api/v1/services/${serviceId}/events`)
    .then((page) => page.content);
}
