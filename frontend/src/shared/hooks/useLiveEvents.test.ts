import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useLiveEvents } from "./useLiveEvents";
import { installMockEventSource, MockEventSource } from "@/test/mockEventSource";

let restoreEventSource: () => void;

beforeEach(() => {
  restoreEventSource = installMockEventSource();
});

afterEach(() => {
  restoreEventSource();
});

describe("useLiveEvents", () => {
  it("otevře jedno SSE spojení na /api/v1/events/services", () => {
    renderHook(() => useLiveEvents());

    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toContain("/api/v1/events/services");
  });

  it("příchozí metric event přidá do metricEvents", () => {
    const { result } = renderHook(() => useLiveEvents());
    const source = MockEventSource.instances[0];
    const metric = {
      serviceId: 1,
      serviceName: "demo-service-a",
      metricName: "cpu_usage",
      value: 0.5,
      recordedAt: "2026-01-01T00:00:00Z",
    };

    act(() => source.emit("metric", metric));

    expect(result.current.metricEvents).toEqual([metric]);
  });

  it("příchozí alert event přidá do alertEvents", () => {
    const { result } = renderHook(() => useLiveEvents());
    const source = MockEventSource.instances[0];
    const alert = {
      alertId: 1,
      serviceId: 1,
      serviceName: "demo-service-a",
      metricName: "cpu_usage",
      triggeringValue: 95,
      status: "TRIGGERED" as const,
      timestamp: "2026-01-01T00:00:00Z",
    };

    act(() => source.emit("alert", alert));

    expect(result.current.alertEvents).toEqual([alert]);
  });

  it("příchozí timeline event přidá do timelineEvents", () => {
    const { result } = renderHook(() => useLiveEvents());
    const source = MockEventSource.instances[0];
    const timelineEvent = {
      id: 1,
      serviceId: 1,
      serviceName: "demo-service-a",
      type: "HEALTH_DOWN" as const,
      message: "Služba přestala odpovídat.",
      occurredAt: "2026-01-01T00:00:00Z",
    };

    act(() => source.emit("event", timelineEvent));

    expect(result.current.timelineEvents).toEqual([timelineEvent]);
  });

  it("drží nejvýš 20 posledních položek na typ, nejnovější první", () => {
    const { result } = renderHook(() => useLiveEvents());
    const source = MockEventSource.instances[0];

    act(() => {
      for (let i = 0; i < 25; i++) {
        source.emit("metric", {
          serviceId: 1,
          serviceName: "demo-service-a",
          metricName: "cpu_usage",
          value: i,
          recordedAt: `t${i}`,
        });
      }
    });

    expect(result.current.metricEvents).toHaveLength(20);
    expect(result.current.metricEvents[0].value).toBe(24);
  });

  it("při unmountu zavře SSE spojení", () => {
    const { unmount } = renderHook(() => useLiveEvents());
    const source = MockEventSource.instances[0];

    unmount();

    expect(source.closed).toBe(true);
  });
});
