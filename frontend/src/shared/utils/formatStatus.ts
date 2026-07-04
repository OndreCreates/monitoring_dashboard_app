import type { AlertEventStatus, EventType } from "@/api/types";

/** Czech labels for AlertEvent status badges (AlertsPage, LiveActivityTabs). */
export function formatAlertEventStatus(status: AlertEventStatus): string {
  return status === "TRIGGERED" ? "Spuštěno" : "Vyřešeno";
}

/** Czech labels for Event type badges (EventsPage timeline). */
export function formatEventType(type: EventType): string {
  switch (type) {
    case "SERVICE_REGISTERED":
      return "Registrace";
    case "HEALTH_UP":
      return "Obnoveno";
    case "HEALTH_DOWN":
      return "Výpadek";
    case "ALERT_TRIGGERED":
      return "Alert spuštěn";
    case "ALERT_RESOLVED":
      return "Alert vyřešen";
  }
}
