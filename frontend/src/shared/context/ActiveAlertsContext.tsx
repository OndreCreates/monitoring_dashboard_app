import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchAlertEvents } from "@/api/alerts";
import { useAlerts } from "@/shared/hooks/useAlerts";
import { useLiveEvents } from "@/shared/hooks/useLiveEvents";

interface ActiveAlertsContextValue {
  activeCount: number;
  activeByServiceId: Record<number, number>;
}

const ActiveAlertsContext = createContext<ActiveAlertsContextValue | null>(null);

/**
 * Which alerts are currently TRIGGERED (not yet RESOLVED) — baseline comes from each
 * alert's most recent event (same per-alert fetch AlertEventsList already does), then
 * kept live via SSE so it doesn't need repolling. A single provider so the Sidebar badge
 * and the Dashboard leaderboard share one computation instead of fetching it twice.
 */
export function ActiveAlertsProvider({ children }: { children: ReactNode }) {
  const { alerts } = useAlerts();
  const { alertEvents } = useLiveEvents();
  const [baseline, setBaseline] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (alerts.length === 0) return;
    let cancelled = false;
    Promise.all(
      alerts.map((alert) =>
        fetchAlertEvents(alert.id).then((events) => ({
          alertId: alert.id,
          active: events[0]?.status === "TRIGGERED",
        })),
      ),
    ).then((results) => {
      if (cancelled) return;
      const map: Record<number, boolean> = {};
      results.forEach((result) => {
        map[result.alertId] = result.active;
      });
      setBaseline(map);
    });
    return () => {
      cancelled = true;
    };
  }, [alerts]);

  const activeByAlertId = useMemo(() => {
    const map = { ...baseline };
    // alertEvents is newest-first (see useLiveEvents) — only the first event seen
    // for a given alertId is its current status; later (older) entries must not
    // overwrite it back to a stale value.
    const seen = new Set<number>();
    for (const event of alertEvents) {
      if (seen.has(event.alertId)) continue;
      seen.add(event.alertId);
      map[event.alertId] = event.status === "TRIGGERED";
    }
    return map;
  }, [baseline, alertEvents]);

  const value = useMemo(() => {
    const activeByServiceId: Record<number, number> = {};
    for (const alert of alerts) {
      if (activeByAlertId[alert.id]) {
        activeByServiceId[alert.serviceId] = (activeByServiceId[alert.serviceId] ?? 0) + 1;
      }
    }
    const activeCount = Object.values(activeByAlertId).filter(Boolean).length;
    return { activeCount, activeByServiceId };
  }, [alerts, activeByAlertId]);

  return <ActiveAlertsContext.Provider value={value}>{children}</ActiveAlertsContext.Provider>;
}

export function useActiveAlerts() {
  const context = useContext(ActiveAlertsContext);
  if (!context) throw new Error("useActiveAlerts must be used within ActiveAlertsProvider");
  return context;
}
