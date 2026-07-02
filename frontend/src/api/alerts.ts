import { apiClient } from "@/api/client";
import type { AlertEventResponse, AlertRequest, AlertResponse } from "@/api/types";

export function fetchAlerts() {
  return apiClient.get<AlertResponse[]>("/api/v1/alerts");
}

export function createAlert(request: AlertRequest) {
  return apiClient.post<AlertResponse>("/api/v1/alerts", request);
}

export function deleteAlert(id: number) {
  return apiClient.del(`/api/v1/alerts/${id}`);
}

export function fetchAlertEvents(alertId: number) {
  return apiClient.get<AlertEventResponse[]>(`/api/v1/alerts/${alertId}/events`);
}
