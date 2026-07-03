import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { useServices } from "@/shared/hooks/useServices";
import { useAlerts } from "@/shared/hooks/useAlerts";
import { useLiveEvents } from "@/shared/hooks/useLiveEvents";
import { fetchServiceMetrics } from "@/api/services";
import type { MetricResponse, ServiceResponse } from "@/api/types";
import { formatMetricValue } from "@/shared/utils/formatMetric";
import { ResponseTimeChart } from "@/features/dashboard/ResponseTimeChart";

export function DashboardPage() {
  const { services, loading: servicesLoading, error: servicesError } = useServices();
  const { alerts, loading: alertsLoading } = useAlerts();
  const { metricEvents, alertEvents } = useLiveEvents();

  const kpis = [
    { label: "Monitored services", value: servicesLoading ? "…" : String(services.length) },
    { label: "Alert rules", value: alertsLoading ? "…" : String(alerts.length) },
    { label: "Live metrics received", value: String(metricEvents.length) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Přehled monitorovaných služeb a jejich stavu v reálném čase.
        </p>
      </div>

      {servicesError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Nepodařilo se načíst data z backendu ({servicesError}). Běží backend na správné adrese?
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardTitle>{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-semibold">{kpi.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Response time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponseTimeChart services={services} liveEvents={metricEvents} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Alert activity (SSE)</CardTitle>
        </CardHeader>
        <CardContent>
          {alertEvents.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
              Zatím žádná alert aktivita.
            </div>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {alertEvents.map((event, index) => (
                <li
                  key={`${event.alertId}-${event.timestamp}-${index}`}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <Badge variant={event.status === "TRIGGERED" ? "destructive" : "success"}>
                    {event.status}
                  </Badge>
                  <span className="font-medium">{event.serviceName}</span>
                  <span className="text-muted-foreground">{event.metricName}</span>
                  <span className="font-mono">{event.triggeringValue}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString("cs-CZ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Live metrics (SSE)</CardTitle>
        </CardHeader>
        <CardContent>
          {metricEvents.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
              Zatím žádné metriky — počkej na první tik schedulera (výchozí interval 30s).
            </div>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {metricEvents.map((event, index) => (
                <li
                  key={`${event.serviceId}-${event.recordedAt}-${index}`}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <span className="font-medium">{event.serviceName}</span>
                  <span className="text-muted-foreground">{event.metricName}</span>
                  {event.metricName === "health_status" ? (
                    <Badge variant={event.value === 1 ? "success" : "destructive"}>
                      {formatMetricValue(event.metricName, event.value)}
                    </Badge>
                  ) : (
                    <span className="font-mono">{formatMetricValue(event.metricName, event.value)}</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.recordedAt).toLocaleTimeString("cs-CZ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Services</CardTitle>
        </CardHeader>
        <CardContent>
          {servicesLoading ? (
            <p className="text-sm text-muted-foreground">Načítám…</p>
          ) : services.length === 0 ? (
            <div className="flex items-center justify-between rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
              <span>Zatím žádná registrovaná služba (POST /api/v1/services).</span>
              <Badge variant="secondary">0 služeb</Badge>
            </div>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {services.map((service) => (
                <ServiceRow key={service.id} service={service} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ServiceRow({ service }: { service: ServiceResponse }) {
  const [latestMetric, setLatestMetric] = useState<MetricResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    // name filter matters now that /metrics is paginated — without it we'd get
    // the last 20 metrics of ANY type, which might not include response_time_ms at all.
    fetchServiceMetrics(service.id, { name: "response_time_ms", size: 1 })
      .then((metrics) => {
        if (!cancelled) setLatestMetric(metrics[0] ?? null);
      })
      .catch(() => {
        if (!cancelled) setLatestMetric(null);
      });
    return () => {
      cancelled = true;
    };
  }, [service.id]);

  return (
    <li>
      <Link
        to={`/services/${service.id}`}
        className="flex items-center justify-between rounded-md border border-border px-3 py-2 hover:bg-accent"
      >
        <div className="flex flex-col">
          <span className="font-medium">{service.name}</span>
          <span className="text-xs text-muted-foreground">{service.url}</span>
        </div>
        {latestMetric ? (
          <Badge variant="success">{latestMetric.value.toFixed(0)} ms</Badge>
        ) : (
          <Badge variant="secondary">no data</Badge>
        )}
      </Link>
    </li>
  );
}
