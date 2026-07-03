import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { useServices } from "@/shared/hooks/useServices";
import { useAlerts } from "@/shared/hooks/useAlerts";
import { useLiveEvents } from "@/shared/hooks/useLiveEvents";
import { fetchServiceMetrics } from "@/api/services";
import type { MetricResponse, ServiceResponse } from "@/api/types";
import { ServiceComparisonChart, LINE_COLORS } from "@/shared/components/ServiceComparisonChart";
import { ServiceLeaderboard } from "@/features/dashboard/ServiceLeaderboard";
import { LiveActivityTabs } from "@/features/dashboard/LiveActivityTabs";

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
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
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
            <CardContent className="flex items-center justify-between py-4">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              <span className="text-2xl font-semibold">{kpi.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="md:col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Response time</CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceComparisonChart
              services={services}
              metricName="response_time_ms"
              liveEvents={metricEvents}
              height={150}
            />
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Žebříček služeb</CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceLeaderboard services={services} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Živá aktivita (SSE)</CardTitle>
          </CardHeader>
          <CardContent>
            <LiveActivityTabs alertEvents={alertEvents} metricEvents={metricEvents} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 xl:col-span-4">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Services</CardTitle>
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <p className="text-sm text-muted-foreground">Načítám…</p>
            ) : services.length === 0 ? (
              <div className="flex items-center justify-between rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                <span>Zatím žádná registrovaná služba.</span>
                <Badge variant="secondary">0 služeb</Badge>
              </div>
            ) : (
              <ul className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto text-sm md:grid-cols-2 xl:grid-cols-4">
                {services.map((service, index) => (
                  <ServiceRow key={service.id} service={service} color={LINE_COLORS[index % LINE_COLORS.length]} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ServiceRow({ service, color }: { service: ServiceResponse; color: string }) {
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
        className="flex items-center gap-3 rounded-md border border-border px-3 py-2 hover:bg-accent"
      >
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {service.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{service.name}</span>
          <span className="truncate text-xs text-muted-foreground">{service.url}</span>
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
