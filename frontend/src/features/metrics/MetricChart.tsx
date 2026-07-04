import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchServiceMetrics } from "@/api/services";
import type { ServiceMetricEvent } from "@/api/types";
import { formatMetricValue } from "@/shared/utils/formatMetric";
import { useSettings } from "@/shared/context/SettingsContext";

export function MetricChart({
  serviceId,
  metricName,
  label,
  liveEvents,
}: {
  serviceId: number;
  metricName: string;
  label: string;
  liveEvents: ServiceMetricEvent[];
}) {
  const { chartPoints } = useSettings();

  // REST baseline fetched once per service+metric; live SSE events merged in
  // via useMemo at render time (see ServiceComparisonChart for why: avoids
  // setState-in-effect on every incoming event).
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchServiceMetrics(serviceId, { name: metricName, size: chartPoints }).then((metrics) => {
      if (cancelled) return;
      setHistory(metrics.reverse().map((metric) => metric.value));
    });
    return () => {
      cancelled = true;
    };
  }, [serviceId, metricName, chartPoints]);

  const data = useMemo(() => {
    const values = [...history];
    for (const event of liveEvents) {
      if (event.serviceId === serviceId && event.metricName === metricName) {
        values.push(event.value);
      }
    }
    return values.slice(-chartPoints).map((value, index) => ({ index, value }));
  }, [history, liveEvents, serviceId, metricName, chartPoints]);

  const latest = data.at(-1)?.value;
  // health_status is binary (0/1 → DOWN/UP) — Recharts' default auto-ticks land on
  // intermediate values like 0.33/0.66 too, which formatMetricValue also renders as
  // "DOWN", producing duplicate stacked labels. Pin the ticks to the two real values.
  const isHealthStatus = metricName === "health_status";
  // Counts are always whole numbers — without this, Recharts' "nice" auto-tick step
  // (e.g. 0.75) plus toFixed(0) rounding produces two adjacent ticks reading the same integer.
  const isIntegerMetric = metricName === "response_time_ms" || metricName === "request_count" || metricName === "error_count";

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-lg font-semibold">
          {latest !== undefined ? formatMetricValue(metricName, latest) : "—"}
        </span>
      </div>
      {data.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
          Zatím žádná data.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="index" hide />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={10}
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
            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
