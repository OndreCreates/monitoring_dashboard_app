import { useEffect, useState } from "react";
import { fetchAlerts } from "@/api/alerts";
import type { AlertResponse } from "@/api/types";

export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAlerts()
      .then((data) => {
        if (!cancelled) setAlerts(data);
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

  return { alerts, loading, error };
}
