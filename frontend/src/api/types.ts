export interface ServiceResponse {
  id: number;
  name: string;
  url: string;
  createdAt: string;
}

export interface MetricResponse {
  id: number;
  name: string;
  value: number;
  recordedAt: string;
}

export type AlertComparison = "GREATER_THAN" | "LESS_THAN";

export interface AlertResponse {
  id: number;
  serviceId: number;
  metricName: string;
  threshold: number;
  comparison: AlertComparison;
  enabled: boolean;
}

export interface AlertRequest {
  serviceId: number;
  metricName: string;
  threshold: number;
  comparison: AlertComparison;
  enabled: boolean;
}

export type AlertEventStatus = "TRIGGERED" | "RESOLVED";

export interface AlertEventResponse {
  id: number;
  alertId: number;
  triggeringValue: number;
  status: AlertEventStatus;
  triggeredAt: string;
  resolvedAt: string | null;
}

/** Payload pushed over the `metric` SSE event — viz backend ServiceMetricEvent. */
export interface ServiceMetricEvent {
  serviceId: number;
  serviceName: string;
  metricName: string;
  value: number;
  recordedAt: string;
}

/** Payload pushed over the `alert` SSE event — viz backend AlertEventNotification. */
export interface AlertEventNotification {
  alertId: number;
  serviceId: number;
  serviceName: string;
  metricName: string;
  triggeringValue: number;
  status: AlertEventStatus;
  timestamp: string;
}
