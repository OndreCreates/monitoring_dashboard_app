import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThresholdEditor } from "./ThresholdEditor";
import * as servicesApi from "@/api/services";

vi.mock("@/api/services");

const mockedApi = vi.mocked(servicesApi);

// CHART_HEIGHT=160, MARGIN.top=10, MARGIN.bottom=10 → PLOT_HEIGHT=140 (viz ThresholdEditor.tsx).
// Prázdná historie + threshold=50 → dataMax=50 → domainMax = 50 * 1.3 = 65.
function renderEditor(threshold: number) {
  const onThresholdChange = vi.fn();
  const { container } = render(
    <ThresholdEditor
      serviceId={1}
      metricName="cpu_usage"
      threshold={threshold}
      comparison="GREATER_THAN"
      onThresholdChange={onThresholdChange}
    />,
  );

  const dragHandle = container.querySelector<HTMLDivElement>(".cursor-ns-resize");
  const plotContainer = container.querySelector<HTMLDivElement>(".relative.select-none");
  if (!dragHandle || !plotContainer) {
    throw new Error("Nenalezen drag handle nebo kontejner grafu — zkontroluj třídy v ThresholdEditor.tsx.");
  }

  vi.spyOn(plotContainer, "getBoundingClientRect").mockReturnValue({
    top: 0,
    left: 0,
    right: 300,
    bottom: 160,
    width: 300,
    height: 160,
    x: 0,
    y: 0,
    toJSON: () => {},
  });

  return { dragHandle, onThresholdChange };
}

beforeEach(() => {
  mockedApi.fetchServiceMetrics.mockResolvedValue([]);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
});

describe("ThresholdEditor", () => {
  it("při tažení na střed grafu přepočte pozici na polovinu domainMax", () => {
    const { dragHandle, onThresholdChange } = renderEditor(50);

    fireEvent.pointerDown(dragHandle, { clientY: 80, pointerId: 1 });

    // ratio = (80 - 0 - 10) / 140 = 0.5 → (1 - 0.5) * 65 = 32.5 → zaokrouhleno na 33
    expect(onThresholdChange).toHaveBeenCalledWith(33);
  });

  it("při tažení na horní okraj grafu vrátí domainMax", () => {
    const { dragHandle, onThresholdChange } = renderEditor(50);

    fireEvent.pointerDown(dragHandle, { clientY: 10, pointerId: 1 });

    expect(onThresholdChange).toHaveBeenCalledWith(65);
  });

  it("při tažení pod spodní okraj grafu ořízne hodnotu na 0, ne na zápornou", () => {
    const { dragHandle, onThresholdChange } = renderEditor(50);

    fireEvent.pointerDown(dragHandle, { clientY: 300, pointerId: 1 });

    expect(onThresholdChange).toHaveBeenCalledWith(0);
  });

  it("pointerMove bez předchozího pointerDown hodnotu nemění", () => {
    const { dragHandle, onThresholdChange } = renderEditor(50);

    fireEvent.pointerMove(dragHandle, { clientY: 80, pointerId: 1 });

    expect(onThresholdChange).not.toHaveBeenCalled();
  });
});
