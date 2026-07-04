import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchServiceMetrics } from "@/api/services";
import type { ServiceMetricEvent, ServiceResponse } from "@/api/types";
import { formatMetricValue } from "@/shared/utils/formatMetric";
import { useSettings } from "@/shared/context/SettingsContext";

export const LINE_COLORS = ["#8b5cf6", "#22d3ee", "#f97316", "#34d399", "#f472b6"];

/** One metric, all services in a single chart — used on both the Dashboard (fixed to
 * response_time_ms) and the Metrics page's comparison tab (any metric). */
export function ServiceComparisonChart({
  services,
  metricName,
  liveEvents,
  height = 280,
}: {
  services: ServiceResponse[];
  metricName: string;
  liveEvents: ServiceMetricEvent[];
  height?: number;
}) {
  const { chartPoints } = useSettings();
  const [history, setHistory] = useState<Record<number, number[]>>({});

  useEffect(() => {
    if (services.length === 0) return;
    let cancelled = false;
    Promise.all(
      services.map((service) =>
        fetchServiceMetrics(service.id, { name: metricName, size: chartPoints }).then((metrics) => ({
          id: service.id,
          values: metrics.reverse().map((metric) => metric.value),
        })),
      ),
    ).then((results) => {
      if (cancelled) return;
      const initial: Record<number, number[]> = {};
      results.forEach((result) => {
        initial[result.id] = result.values;
      });
      setHistory(initial);
    });
    return () => {
      cancelled = true;
    };
  }, [services, metricName, chartPoints]);

  const data = useMemo(() => {
    const merged: Record<number, number[]> = {};
    for (const service of services) {
      merged[service.id] = [...(history[service.id] ?? [])];
    }
    for (const event of liveEvents) {
      if (event.metricName !== metricName) continue;
      const arr = merged[event.serviceId] ?? (merged[event.serviceId] = []);
      arr.push(event.value);
    }
    for (const id of Object.keys(merged)) {
      merged[Number(id)] = merged[Number(id)].slice(-chartPoints);
    }

    const maxLen = Math.max(0, ...Object.values(merged).map((values) => values.length));
    return Array.from({ length: maxLen }, (_, index) => {
      const point: Record<string, number> = { index };
      for (const service of services) {
        const values = merged[service.id];
        if (values?.[index] !== undefined) {
          point[service.name] = values[index];
        }
      }
      return point;
    });
  }, [services, history, liveEvents, metricName, chartPoints]);

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
        Zatím žádná data — počkej na první tik schedulera.
      </div>
    );
  }

  // health_status is binary (0/1 → DOWN/UP) — Recharts' default auto-ticks land on
  // intermediate values like 0.33/0.66 too, which formatMetricValue also renders as
  // "DOWN", producing duplicate stacked labels. Pin the ticks to the two real values.
  const isHealthStatus = metricName === "health_status";
  // Counts are always whole numbers — without this, Recharts' "nice" auto-tick step
  // (e.g. 0.75) plus toFixed(0) rounding produces two adjacent ticks reading the same integer.
  const isIntegerMetric = metricName === "response_time_ms" || metricName === "request_count" || metricName === "error_count";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="index" stroke="var(--muted-foreground)" fontSize={12} />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          width={60}
          domain={isHealthStatus ? [0, 1] : undefined}
          ticks={isHealthStatus ? [0, 1] : undefined}
          allowDecimals={!isIntegerMetric}
          tickFormatter={(value) => formatMetricValue(metricName, Number(value))}
        />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
          formatter={(value) => formatMetricValue(metricName, Number(value))}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {services.map((service, index) => (
          <Line
            key={service.id}
            type="monotone"
            dataKey={service.name}
            stroke={LINE_COLORS[index % LINE_COLORS.length]}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
