import { apiClient } from "@/api/client";
import type { MetricResponse, ServiceResponse } from "@/api/types";

export function fetchServices() {
  return apiClient.get<ServiceResponse[]>("/api/v1/services");
}

export function fetchServiceMetrics(serviceId: number) {
  return apiClient.get<MetricResponse[]>(`/api/v1/services/${serviceId}/metrics`);
}
