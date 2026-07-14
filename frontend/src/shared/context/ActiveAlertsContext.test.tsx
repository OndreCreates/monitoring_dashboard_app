import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ActiveAlertsProvider, useActiveAlerts } from "./ActiveAlertsContext";
import * as alertsApi from "@/api/alerts";
import { installMockEventSource, MockEventSource } from "@/test/mockEventSource";

vi.mock("@/api/alerts");

const mockedAlertsApi = vi.mocked(alertsApi);

function Probe() {
  const { activeCount, activeByServiceId } = useActiveAlerts();
  return (
    <div>
      <span data-testid="count">{activeCount}</span>
      <span data-testid="byService">{JSON.stringify(activeByServiceId)}</span>
    </div>
  );
}

let restoreEventSource: () => void;

beforeEach(() => {
  restoreEventSource = installMockEventSource();
  mockedAlertsApi.fetchAlerts.mockResolvedValue([
    { id: 1, serviceId: 10, metricName: "cpu_usage", threshold: 80, comparison: "GREATER_THAN", enabled: true },
    { id: 2, serviceId: 20, metricName: "error_count", threshold: 5, comparison: "GREATER_THAN", enabled: true },
  ]);
  mockedAlertsApi.fetchAlertEvents.mockImplementation((alertId: number) =>
    Promise.resolve(
      alertId === 1
        ? [{ id: 100, alertId: 1, triggeringValue: 90, status: "TRIGGERED" as const, triggeredAt: "t", resolvedAt: null }]
        : [],
    ),
  );
});

afterEach(() => {
  restoreEventSource();
});

describe("ActiveAlertsProvider", () => {
  it("spočítá aktivní alerty z baseline (poslední AlertEvent na alert)", async () => {
    render(
      <ActiveAlertsProvider>
        <Probe />
      </ActiveAlertsProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("1"));
    expect(screen.getByTestId("byService")).toHaveTextContent('{"10":1}');
  });

  it("živý SSE alert event přepíše baseline stav pro daný alert", async () => {
    render(
      <ActiveAlertsProvider>
        <Probe />
      </ActiveAlertsProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("1"));

    const source = MockEventSource.instances[0];
    act(() => {
      source.emit("alert", {
        alertId: 1,
        serviceId: 10,
        serviceName: "demo-service-a",
        metricName: "cpu_usage",
        triggeringValue: 10,
        status: "RESOLVED",
        timestamp: "t2",
      });
    });

    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("0"));
  });

  it("useActiveAlerts mimo provider vyhodí chybu", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow("useActiveAlerts must be used within ActiveAlertsProvider");

    consoleErrorSpy.mockRestore();
  });
});
