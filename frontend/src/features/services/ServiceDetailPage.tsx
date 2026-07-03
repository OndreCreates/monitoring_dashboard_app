import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { useAlerts } from "@/shared/hooks/useAlerts";
import { useLiveEvents } from "@/shared/hooks/useLiveEvents";
import { fetchService, fetchServiceUptime } from "@/api/services";
import { fetchServiceEvents } from "@/api/events";
import { MetricChart } from "@/features/metrics/MetricChart";
import type { EventResponse, ServiceResponse, UptimeResponse } from "@/api/types";

const METRICS = [
  { name: "health_status", label: "Health status" },
  { name: "response_time_ms", label: "Response time" },
  { name: "cpu_usage", label: "CPU usage" },
  { name: "memory_used", label: "Memory used" },
  { name: "disk_free", label: "Disk free" },
  { name: "request_count", label: "Request count" },
  { name: "error_count", label: "Error count" },
];

function UptimeBadge({ uptime }: { uptime: UptimeResponse | null }) {
  if (!uptime || uptime.percentage === null) {
    return <Badge variant="secondary">uptime: zatím žádná data</Badge>;
  }
  const variant = uptime.percentage >= 99 ? "success" : uptime.percentage >= 95 ? "secondary" : "destructive";
  return (
    <Badge variant={variant}>
      {uptime.percentage.toFixed(1)} % uptime (posledních {uptime.days} dní)
    </Badge>
  );
}

export function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const serviceId = Number(id);

  const [service, setService] = useState<ServiceResponse | null>(null);
  const [uptime, setUptime] = useState<UptimeResponse | null>(null);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [notFound, setNotFound] = useState(false);

  const { alerts } = useAlerts();
  const { metricEvents } = useLiveEvents();

  useEffect(() => {
    let cancelled = false;
    fetchService(serviceId)
      .then((data) => {
        if (!cancelled) setService(data);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });
    fetchServiceUptime(serviceId).then((data) => {
      if (!cancelled) setUptime(data);
    });
    fetchServiceEvents(serviceId).then((data) => {
      if (!cancelled) setEvents(data);
    });
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  if (notFound) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">Služba nenalezena.</p>
        <Button variant="outline" onClick={() => navigate("/services")}>
          Zpět na Services
        </Button>
      </div>
    );
  }

  const serviceAlerts = alerts.filter((alert) => alert.serviceId === serviceId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/services"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Services
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{service?.name ?? "…"}</h1>
          <UptimeBadge uptime={uptime} />
        </div>
        <p className="text-sm text-muted-foreground">{service?.url}</p>
        {service && service.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {service.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">Metriky</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map((metric) => (
            <MetricChart
              key={metric.name}
              serviceId={serviceId}
              metricName={metric.name}
              label={metric.label}
              liveEvents={metricEvents}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Alert pravidla</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Pro tuto službu zatím žádné pravidlo.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {serviceAlerts.map((alert) => (
                <li key={alert.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <span>
                    {alert.metricName} {alert.comparison === "GREATER_THAN" ? ">" : "<"} {alert.threshold}
                  </span>
                  <Badge variant={alert.enabled ? "success" : "secondary"}>
                    {alert.enabled ? "enabled" : "disabled"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Historie událostí</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Zatím žádné události.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <Badge variant="secondary">{event.type}</Badge>
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
