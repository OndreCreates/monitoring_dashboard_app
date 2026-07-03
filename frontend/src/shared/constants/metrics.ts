/** The 7 metric types MetricCollectorScheduler records for every service (see docs/architecture.md). */
export const METRICS = [
  { name: "health_status", label: "Health status" },
  { name: "response_time_ms", label: "Response time" },
  { name: "cpu_usage", label: "CPU usage" },
  { name: "memory_used", label: "Memory used" },
  { name: "disk_free", label: "Disk free" },
  { name: "request_count", label: "Request count" },
  { name: "error_count", label: "Error count" },
];

export const METRIC_NAMES = METRICS.map((metric) => metric.name);
