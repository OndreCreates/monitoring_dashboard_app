import { type FormEvent, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { useServices } from "@/shared/hooks/useServices";
import { useAlerts } from "@/shared/hooks/useAlerts";
import { createAlert, deleteAlert, fetchAlertEvents } from "@/api/alerts";
import type { AlertComparison, AlertEventResponse } from "@/api/types";

const METRIC_OPTIONS = ["response_time_ms", "health_status", "cpu_usage", "memory_used"];

export function AlertsPage() {
  const { services } = useServices();
  const { alerts, loading, error, refetch } = useAlerts();

  const [serviceId, setServiceId] = useState<number | "">("");
  const [metricName, setMetricName] = useState(METRIC_OPTIONS[0]);
  const [threshold, setThreshold] = useState("");
  const [comparison, setComparison] = useState<AlertComparison>("GREATER_THAN");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (serviceId === "" || threshold === "") return;
    setSubmitting(true);
    setFormError(null);
    try {
      await createAlert({
        serviceId: Number(serviceId),
        metricName,
        threshold: Number(threshold),
        comparison,
        enabled: true,
      });
      setThreshold("");
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Nepodařilo se vytvořit pravidlo.");
    } finally {
      setSubmitting(false);
    }
  }

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Nové pravidlo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Služba
              <select
                className="rounded-md border border-input bg-transparent px-2 py-1.5 text-sm"
                value={serviceId}
                onChange={(event) =>
                  setServiceId(event.target.value === "" ? "" : Number(event.target.value))
                }
                required
              >
                <option value="" disabled>
                  vyber službu
                </option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Metrika
              <select
                className="rounded-md border border-input bg-transparent px-2 py-1.5 text-sm"
                value={metricName}
                onChange={(event) => setMetricName(event.target.value)}
              >
                {METRIC_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Podmínka
              <select
                className="rounded-md border border-input bg-transparent px-2 py-1.5 text-sm"
                value={comparison}
                onChange={(event) => setComparison(event.target.value as AlertComparison)}
              >
                <option value="GREATER_THAN">větší než</option>
                <option value="LESS_THAN">menší než</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Práh
              <input
                type="number"
                step="any"
                className="w-28 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm"
                value={threshold}
                onChange={(event) => setThreshold(event.target.value)}
                required
              />
            </label>

            <Button type="submit" disabled={submitting}>
              Vytvořit pravidlo
            </Button>
          </form>
          {formError && <p className="mt-2 text-sm text-destructive">{formError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Pravidla</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {loading ? (
            <p className="text-sm text-muted-foreground">Načítám…</p>
          ) : alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Zatím žádné pravidlo.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {alerts.map((alert) => {
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
