import { useEffect, useState } from "react";
import { fetchServices } from "@/api/services";
import type { ServiceResponse } from "@/api/types";

export function useServices() {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchServices()
      .then((data) => {
        if (!cancelled) setServices(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { services, loading, error };
}
