/** Formats a raw metric value for display, based on its name (see backend MetricCollectorScheduler). */
export function formatMetricValue(name: string, value: number): string {
  switch (name) {
    case "response_time_ms":
      return `${value.toFixed(0)} ms`;
    case "cpu_usage":
      // 2 decimals, not 1 — idle demo services report well under 1% CPU, where a single
      // decimal rounds every axis tick to the same "0.0 %"/"0.1 %" and they look duplicated.
      return `${(value * 100).toFixed(2)} %`;
    case "memory_used":
      return `${(value / 1024 / 1024).toFixed(1)} MB`;
    case "disk_free":
      return `${(value / 1024 / 1024 / 1024).toFixed(1)} GB`;
    case "health_status":
      return value === 1 ? "UP" : "DOWN";
    case "request_count":
    case "error_count":
      return value.toFixed(0);
    default:
      return String(value);
  }
}
