import { useEffect, useMemo, useRef, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { fetchServiceMetrics } from "@/api/services";
import { formatMetricValue } from "@/shared/utils/formatMetric";
import type { AlertComparison } from "@/api/types";

const CHART_HEIGHT = 160;
const Y_AXIS_WIDTH = 56;
const MARGIN = { top: 10, right: 12, bottom: 10 };
const PLOT_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

/**
 * Draggable threshold line over a recent-history sparkline — an alternative to typing
 * a number blind, since you can see where the threshold sits relative to actual values.
 * Implemented as a plain absolutely-positioned overlay (not a Recharts ReferenceLine)
 * because Recharts has no built-in drag support; this way the drag math is just
 * pixel-to-domain-value conversion using this component's own known margins, no need
 * to reach into Recharts' internal coordinate system.
 */
export function ThresholdEditor({
  serviceId,
  metricName,
  threshold,
  comparison,
  onThresholdChange,
}: {
  serviceId: number;
  metricName: string;
  threshold: number;
  comparison: AlertComparison;
  onThresholdChange: (value: number) => void;
}) {
  const [values, setValues] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchServiceMetrics(serviceId, { name: metricName, size: 30 }).then((metrics) => {
      if (!cancelled) setValues(metrics.reverse().map((metric) => metric.value));
    });
    return () => {
      cancelled = true;
    };
  }, [serviceId, metricName]);

  const domainMax = useMemo(() => {
    const dataMax = Math.max(0, ...values, threshold);
    return dataMax > 0 ? dataMax * 1.3 : Math.max(threshold * 1.5, 1);
  }, [values, threshold]);

  const data = values.map((value, index) => ({ index, value }));

  function updateFromPointer(clientY: number) {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientY - rect.top - MARGIN.top) / PLOT_HEIGHT));
    const rawValue = (1 - ratio) * domainMax;
    const rounded = domainMax > 20 ? Math.round(rawValue) : Math.round(rawValue * 100) / 100;
    onThresholdChange(Math.max(0, rounded));
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event.clientY);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    updateFromPointer(event.clientY);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const thresholdRatio = Math.min(1, Math.max(0, threshold / domainMax));
  const lineTopPx = MARGIN.top + (1 - thresholdRatio) * PLOT_HEIGHT;

  return (
    <div ref={containerRef} className="relative select-none" style={{ height: CHART_HEIGHT }}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart data={data} margin={{ top: MARGIN.top, right: MARGIN.right, bottom: MARGIN.bottom, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="index" hide />
          <YAxis
            width={Y_AXIS_WIDTH}
            domain={[0, domainMax]}
            stroke="var(--muted-foreground)"
            fontSize={10}
            tickFormatter={(value) => formatMetricValue(metricName, Number(value))}
          />
          <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute flex cursor-ns-resize items-center gap-2"
        style={{ left: Y_AXIS_WIDTH, right: MARGIN.right, top: lineTopPx - 10, height: 20 }}
      >
        <div className="h-0.5 flex-1 border-t-2 border-dashed border-amber-500" />
        <span className="whitespace-nowrap rounded bg-amber-500 px-1.5 py-0.5 text-xs font-medium text-black">
          {comparison === "GREATER_THAN" ? ">" : "<"} {formatMetricValue(metricName, threshold)}
        </span>
      </div>
    </div>
  );
}
