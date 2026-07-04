import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { fetchRecentEvents } from "@/api/events";
import { useLiveEvents } from "@/shared/hooks/useLiveEvents";
import { formatEventType } from "@/shared/utils/formatStatus";
import type { EventResponse, EventType } from "@/api/types";

const EVENT_BADGE_VARIANT: Record<EventType, "success" | "destructive" | "secondary"> = {
  SERVICE_REGISTERED: "secondary",
  HEALTH_UP: "success",
  HEALTH_DOWN: "destructive",
  ALERT_TRIGGERED: "destructive",
  ALERT_RESOLVED: "success",
};

export function EventsPage() {
  const [history, setHistory] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { timelineEvents } = useLiveEvents();

  useEffect(() => {
    let cancelled = false;
    fetchRecentEvents()
      .then((data) => {
        if (!cancelled) setHistory(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const knownIds = new Set(history.map((event) => event.id));
  const newLiveEvents = timelineEvents.filter((event) => !knownIds.has(event.id));
  const events = [...newLiveEvents, ...history];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground">
          Kurovaná časová osa významných momentů — registrace služeb, výpadky a alerty (ne raw log).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Historie</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Načítám…</p>
          ) : events.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
              Zatím žádné události.
            </div>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <Badge variant={EVENT_BADGE_VARIANT[event.type]}>{formatEventType(event.type)}</Badge>
                  <span className="font-medium">{event.serviceName}</span>
                  <span className="flex-1 px-3 text-muted-foreground">{event.message}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.occurredAt).toLocaleString("cs-CZ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
