import { useFetch } from "@/shared/hooks/useFetch";
import { fetchServices } from "@/api/services";
import type { ServiceResponse } from "@/api/types";

export function useServices() {
  const { data: services, loading, error, refetch } = useFetch<ServiceResponse[]>(fetchServices, []);
  return { services, loading, error, refetch };
}
