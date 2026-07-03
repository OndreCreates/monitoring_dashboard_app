import { useFetch } from "@/shared/hooks/useFetch";
import { fetchAlerts } from "@/api/alerts";
import type { AlertResponse } from "@/api/types";

export function useAlerts() {
  const { data: alerts, loading, error, refetch } = useFetch<AlertResponse[]>(fetchAlerts, []);
  return { alerts, loading, error, refetch };
}
