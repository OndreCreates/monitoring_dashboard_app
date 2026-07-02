import { apiClient } from "@/api/client";
import type { MetricResponse, ServiceRequest, ServiceResponse } from "@/api/types";

export function fetchServices() {
  return apiClient.get<ServiceResponse[]>("/api/v1/services");
}

export function createService(request: ServiceRequest) {
  return apiClient.post<ServiceResponse>("/api/v1/services", request);
}

export function deleteService(id: number) {
  return apiClient.del(`/api/v1/services/${id}`);
}

export function fetchServiceMetrics(serviceId: number) {
  return apiClient.get<MetricResponse[]>(`/api/v1/services/${serviceId}/metrics`);
}
