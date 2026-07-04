import { MetricChart } from "@/features/metrics/MetricChart";
import { METRICS } from "@/shared/constants/metrics";
import type { ServiceMetricEvent } from "@/api/types";

/** All 7 metric mini-charts for one service — used by MetricsPage's "per service" tab and ServiceDetailPage. */
export function MetricsGrid({
  serviceId,
  liveEvents,
}: {
  serviceId: number;
  liveEvents: ServiceMetricEvent[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {METRICS.map((metric) => (
        <MetricChart
          key={metric.name}
          serviceId={serviceId}
          metricName={metric.name}
          label={metric.label}
          liveEvents={liveEvents}
        />
      ))}
    </div>
  );
}
