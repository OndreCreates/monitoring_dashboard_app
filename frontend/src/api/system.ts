import { apiClient } from "@/api/client";
import type { SystemInfoResponse } from "@/api/types";

export function fetchSystemInfo() {
  return apiClient.get<SystemInfoResponse>("/api/v1/system-info");
}
