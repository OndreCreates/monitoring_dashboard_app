import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Select } from "@/shared/components/Select";
import { useServices } from "@/shared/hooks/useServices";
import { useLiveEvents } from "@/shared/hooks/useLiveEvents";
import { MetricChart } from "@/features/metrics/MetricChart";

const METRICS = [
  { name: "health_status", label: "Health status" },
  { name: "response_time_ms", label: "Response time" },
  { name: "cpu_usage", label: "CPU usage" },
  { name: "memory_used", label: "Memory used" },
  { name: "disk_free", label: "Disk free" },
  { name: "request_count", label: "Request count" },
  { name: "error_count", label: "Error count" },
];

export function MetricsPage() {
  const { services, loading } = useServices();
  const { metricEvents } = useLiveEvents();
  const [serviceId, setServiceId] = useState<number | "">("");

  const selectedId = serviceId === "" ? services[0]?.id : serviceId;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Metrics</h1>
        <p className="text-sm text-muted-foreground">
          Historie a živý průběh všech sbíraných metrik pro vybranou službu.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Služba</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Načítám…</p>
          ) : services.length === 0 ? (
            <p className="text-sm text-muted-foreground">Zatím žádná registrovaná služba.</p>
          ) : (
            <Select
              className="w-64"
              value={selectedId ?? ""}
              onChange={(event) => setServiceId(Number(event.target.value))}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedId !== undefined && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map((metric) => (
            <MetricChart
              key={metric.name}
              serviceId={selectedId}
              metricName={metric.name}
              label={metric.label}
              liveEvents={metricEvents}
            />
          ))}
        </div>
      )}
    </div>
  );
}
