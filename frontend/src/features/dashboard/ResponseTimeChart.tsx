import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchServiceMetrics } from "@/api/services";
import type { ServiceMetricEvent, ServiceResponse } from "@/api/types";

const LINE_COLORS = ["#8b5cf6", "#22d3ee", "#f97316", "#34d399", "#f472b6"];
const MAX_POINTS = 20;

export function ResponseTimeChart({
  services,
  liveEvents,
}: {
  services: ServiceResponse[];
  liveEvents: ServiceMetricEvent[];
}) {
  // REST-fetched baseline, set once per service list — live SSE events are
  // merged in at render time via useMemo below, not accumulated in state,
  // so there's no setState-in-effect on every incoming event.
  const [history, setHistory] = useState<Record<number, number[]>>({});

  useEffect(() => {
    if (services.length === 0) return;
    let cancelled = false;
    Promise.all(
      services.map((service) =>
        fetchServiceMetrics(service.id).then((metrics) => ({
          id: service.id,
          values: metrics
            .filter((metric) => metric.name === "response_time_ms")
            .slice(0, MAX_POINTS)
            .reverse()
            .map((metric) => metric.value),
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
  }, [services]);

  const data = useMemo(() => {
    const merged: Record<number, number[]> = {};
    for (const service of services) {
      merged[service.id] = [...(history[service.id] ?? [])];
    }
    for (const event of liveEvents) {
      if (event.metricName !== "response_time_ms") continue;
      const arr = merged[event.serviceId] ?? (merged[event.serviceId] = []);
      arr.push(event.value);
    }
    for (const id of Object.keys(merged)) {
      merged[Number(id)] = merged[Number(id)].slice(-MAX_POINTS);
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
  }, [services, history, liveEvents]);

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
        Zatím žádná data — počkej na první tik schedulera.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="index" stroke="var(--muted-foreground)" fontSize={12} />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} unit=" ms" />
        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
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
