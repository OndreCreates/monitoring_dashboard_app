import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { Select } from "@/shared/components/Select";
import { useServices } from "@/shared/hooks/useServices";
import { useAlerts } from "@/shared/hooks/useAlerts";
import { deleteAlert, fetchAlertEvents } from "@/api/alerts";
import { AlertForm } from "@/features/alerts/AlertForm";
import type { AlertEventResponse } from "@/api/types";

export function AlertsPage() {
  const { services } = useServices();
  const { alerts, loading, error, refetch } = useAlerts();
  const [filterServiceId, setFilterServiceId] = useState<number | "">("");

  const visibleAlerts = useMemo(
    () => (filterServiceId === "" ? alerts : alerts.filter((alert) => alert.serviceId === filterServiceId)),
    [alerts, filterServiceId],
  );

  async function handleDelete(id: number) {
    await deleteAlert(id);
    refetch();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
        <p className="text-sm text-muted-foreground">Definice pravidel a jejich historie výskytů.</p>
      </div>

      <AlertForm services={services} onCreated={refetch} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Pravidla</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {alerts.length > 0 && (
            <Select
              className="w-56"
              value={filterServiceId}
              onChange={(event) =>
                setFilterServiceId(event.target.value === "" ? "" : Number(event.target.value))
              }
            >
              <option value="">Všechny služby</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </Select>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {loading ? (
            <p className="text-sm text-muted-foreground">Načítám…</p>
          ) : alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Zatím žádné pravidlo.</p>
          ) : visibleAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Žádné pravidlo pro vybranou službu.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {visibleAlerts.map((alert) => {
                const service = services.find((candidate) => candidate.id === alert.serviceId);
                return (
                  <li key={alert.id} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-medium">{service?.name ?? `service #${alert.serviceId}`}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          — {alert.metricName} {alert.comparison === "GREATER_THAN" ? ">" : "<"}{" "}
                          {alert.threshold}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.enabled ? "success" : "secondary"}>
                          {alert.enabled ? "enabled" : "disabled"}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(alert.id)}>
                          Smazat
                        </Button>
                      </div>
                    </div>
                    <AlertEventsList alertId={alert.id} />
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AlertEventsList({ alertId }: { alertId: number }) {
  const [events, setEvents] = useState<AlertEventResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAlertEvents(alertId)
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [alertId]);

  if (loading) return null;
  if (events.length === 0) {
    return <p className="mt-2 text-xs text-muted-foreground">Zatím žádný výskyt.</p>;
  }

  return (
    <ul className="mt-2 flex flex-col gap-1">
      {events.slice(0, 5).map((event) => (
        <li key={event.id} className="flex items-center justify-between text-xs text-muted-foreground">
          <Badge variant={event.status === "TRIGGERED" ? "destructive" : "success"}>{event.status}</Badge>
          <span className="font-mono">{event.triggeringValue}</span>
          <span>{new Date(event.triggeredAt).toLocaleString("cs-CZ")}</span>
        </li>
      ))}
    </ul>
  );
}
