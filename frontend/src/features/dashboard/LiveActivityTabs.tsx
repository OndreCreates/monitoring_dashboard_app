import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/Tabs";
import { Badge } from "@/shared/components/Badge";
import { formatMetricValue } from "@/shared/utils/formatMetric";
import type { AlertEventNotification, ServiceMetricEvent } from "@/api/types";

export function LiveActivityTabs({
  alertEvents,
  metricEvents,
}: {
  alertEvents: AlertEventNotification[];
  metricEvents: ServiceMetricEvent[];
}) {
  return (
    <Tabs defaultValue="alerts">
      <TabsList>
        <TabsTrigger value="alerts">Alerty</TabsTrigger>
        <TabsTrigger value="metrics">Metriky</TabsTrigger>
      </TabsList>

      <TabsContent value="alerts" className="mt-4 max-h-44 overflow-y-auto">
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
                <Badge variant={event.status === "TRIGGERED" ? "destructive" : "success"}>{event.status}</Badge>
                <span className="font-medium">{event.serviceName}</span>
                <span className="text-muted-foreground">{event.metricName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(event.timestamp).toLocaleTimeString("cs-CZ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="metrics" className="mt-4 max-h-44 overflow-y-auto">
        {metricEvents.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
            Zatím žádné metriky — počkej na první tik schedulera.
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
      </TabsContent>
    </Tabs>
  );
}
