import { apiClient } from "@/api/client";
import type { AlertResponse } from "@/api/types";

export function fetchAlerts() {
  return apiClient.get<AlertResponse[]>("/api/v1/alerts");
}
