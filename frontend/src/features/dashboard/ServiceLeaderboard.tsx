import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/Tabs";
import { fetchServiceMetrics } from "@/api/services";
import { formatMetricValue } from "@/shared/utils/formatMetric";
import { useActiveAlerts } from "@/shared/hooks/useActiveAlerts";
import type { ServiceResponse } from "@/api/types";

interface Row {
  service: ServiceResponse;
  value: number;
}

function LeaderboardList({ rows, metricName }: { rows: Row[]; metricName: string | null }) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Zatím žádná data.</p>;
  }
  const maxValue = Math.max(...rows.map((row) => row.value), 1);

  return (
    <ul className="flex flex-col gap-2">
      {rows.map(({ service, value }) => (
        <li key={service.id} className="flex items-center gap-3">
          <div className="relative flex-1 overflow-hidden rounded-md bg-secondary">
            <div
              className="absolute inset-y-0 left-0 bg-primary/25"
              style={{ width: `${Math.max((value / maxValue) * 100, 4)}%` }}
            />
            <span className="relative block truncate px-3 py-2 text-sm font-medium">{service.name}</span>
          </div>
          <span className="w-16 shrink-0 text-right text-sm font-semibold">
            {metricName ? formatMetricValue(metricName, value) : value}
          </span>
        </li>
      ))}
    </ul>
  );
}

function useAverageMetric(services: ServiceResponse[], metricName: string) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (services.length === 0) return;
    let cancelled = false;
    Promise.all(
      services.map((service) =>
        fetchServiceMetrics(service.id, { name: metricName, size: 20 }).then((metrics) => {
          const values = metrics.map((metric) => metric.value);
          const average = values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
          return { service, value: average };
        }),
      ),
    ).then((results) => {
      if (!cancelled) setRows(results.sort((a, b) => b.value - a.value));
    });
    return () => {
      cancelled = true;
    };
  }, [services, metricName]);

  return rows;
}

function useLatestMetric(services: ServiceResponse[], metricName: string) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (services.length === 0) return;
    let cancelled = false;
    Promise.all(
      services.map((service) =>
        fetchServiceMetrics(service.id, { name: metricName, size: 1 }).then((metrics) => ({
          service,
          value: metrics[0]?.value ?? 0,
        })),
      ),
    ).then((results) => {
      if (!cancelled) setRows(results.sort((a, b) => b.value - a.value));
    });
    return () => {
      cancelled = true;
    };
  }, [services, metricName]);

  return rows;
}

export function ServiceLeaderboard({ services }: { services: ServiceResponse[] }) {
  const responseTimeRows = useAverageMetric(services, "response_time_ms");
  const errorRows = useLatestMetric(services, "error_count");
  const { activeByServiceId } = useActiveAlerts();

  const alertRows: Row[] = services
    .map((service) => ({ service, value: activeByServiceId[service.id] ?? 0 }))
    .sort((a, b) => b.value - a.value);

  return (
    <Tabs defaultValue="response-time">
      <TabsList>
        <TabsTrigger value="response-time">Response time</TabsTrigger>
        <TabsTrigger value="errors">Chybovost</TabsTrigger>
        <TabsTrigger value="alerts">Alerty</TabsTrigger>
      </TabsList>
      <TabsContent value="response-time" className="mt-4">
        <LeaderboardList rows={responseTimeRows} metricName="response_time_ms" />
      </TabsContent>
      <TabsContent value="errors" className="mt-4">
        <LeaderboardList rows={errorRows} metricName="error_count" />
      </TabsContent>
      <TabsContent value="alerts" className="mt-4">
        <LeaderboardList rows={alertRows} metricName={null} />
      </TabsContent>
    </Tabs>
  );
}
