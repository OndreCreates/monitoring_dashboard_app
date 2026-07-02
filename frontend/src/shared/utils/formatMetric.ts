/** Formats a raw metric value for display, based on its name (see backend MetricCollectorScheduler). */
export function formatMetricValue(name: string, value: number): string {
  switch (name) {
    case "response_time_ms":
      return `${value.toFixed(0)} ms`;
    case "cpu_usage":
      return `${(value * 100).toFixed(1)} %`;
    case "memory_used":
      return `${(value / 1024 / 1024).toFixed(1)} MB`;
    case "health_status":
      return value === 1 ? "UP" : "DOWN";
    default:
      return String(value);
  }
}
