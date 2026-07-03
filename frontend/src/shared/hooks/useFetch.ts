import { useEffect, useState } from "react";

/** Cancellation-guarded fetch with loading/error state and a manual refetch trigger. */
export function useFetch<T>(fetchFn: () => Promise<T>, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchFn()
      .then((result) => {
        if (!cancelled) setData(result);
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
    // fetchFn is expected to be a stable module-level function (e.g. fetchServices),
    // not a prop — only refreshIndex should re-trigger the fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshIndex]);

  const refetch = () => setRefreshIndex((index) => index + 1);

  return { data, loading, error, refetch };
}
