import { apiClient } from "@/api/client";
import type { MetricResponse, PageResponse, ServiceRequest, ServiceResponse } from "@/api/types";

export function fetchServices() {
  return apiClient.get<ServiceResponse[]>("/api/v1/services");
}

export function createService(request: ServiceRequest) {
  return apiClient.post<ServiceResponse>("/api/v1/services", request);
}

export function deleteService(id: number) {
  return apiClient.del(`/api/v1/services/${id}`);
}

/**
 * `name` filters server-side before pagination — required when you want the
 * last N points of one specific metric, not the last N across all metric types.
 */
export function fetchServiceMetrics(serviceId: number, options?: { name?: string; size?: number }) {
  const params = new URLSearchParams();
  if (options?.name) params.set("name", options.name);
  if (options?.size) params.set("size", String(options.size));
  const query = params.toString();
  return apiClient
    .get<PageResponse<MetricResponse>>(`/api/v1/services/${serviceId}/metrics${query ? `?${query}` : ""}`)
    .then((page) => page.content);
}
