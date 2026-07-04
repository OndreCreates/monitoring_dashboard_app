import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommandPalette } from "./CommandPalette";
import * as servicesHook from "@/shared/hooks/useServices";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("@/shared/hooks/useServices");

const mockedUseServices = vi.mocked(servicesHook.useServices);

const PLACEHOLDER = "Hledat stránku nebo službu…";

function openPalette() {
  render(
    <MemoryRouter>
      <CommandPalette />
    </MemoryRouter>,
  );
  fireEvent(window, new CustomEvent("open-command-palette"));
  return screen.getByPlaceholderText(PLACEHOLDER);
}

beforeEach(() => {
  navigateMock.mockReset();
  mockedUseServices.mockReturnValue({
    services: [
      {
        id: 1,
        name: "demo-service-a",
        url: "http://demo-service-a:8081/actuator/health",
        createdAt: "",
        tags: ["production"],
      },
    ],
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
});

describe("CommandPalette", () => {
  it("se po události open-command-palette otevře a zobrazí stránky i služby", () => {
    openPalette();

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("demo-service-a")).toBeInTheDocument();
  });

  it("filtruje položky podle zadaného textu, včetně tagů služby", async () => {
    const input = openPalette();

    await userEvent.setup().type(input, "production");

    expect(screen.getByText("demo-service-a")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("Enter na vybrané položce naviguje na její cestu a zavře paletu", () => {
    const input = openPalette();

    fireEvent.change(input, { target: { value: "demo-service-a" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(navigateMock).toHaveBeenCalledWith("/services/1");
    expect(screen.queryByPlaceholderText(PLACEHOLDER)).not.toBeInTheDocument();
  });

  it("Escape zavře paletu bez navigace", () => {
    const input = openPalette();

    fireEvent.keyDown(input, { key: "Escape" });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(screen.queryByPlaceholderText(PLACEHOLDER)).not.toBeInTheDocument();
  });

  it("má nastavené role dialog/aria-modal, aby ho screen reader rozpoznal jako modal", () => {
    openPalette();

    expect(screen.getByRole("dialog", { name: "Příkazová paleta" })).toBeInTheDocument();
  });

  it("po zavření vrátí focus na prvek, který paletu otevřel", () => {
    render(
      <MemoryRouter>
        <button>Otevřít hledání</button>
        <CommandPalette />
      </MemoryRouter>,
    );
    const trigger = screen.getByRole("button", { name: "Otevřít hledání" });
    trigger.focus();
    expect(trigger).toHaveFocus();

    fireEvent(window, new CustomEvent("open-command-palette"));
    const input = screen.getByPlaceholderText(PLACEHOLDER);
    fireEvent.keyDown(input, { key: "Escape" });

    expect(trigger).toHaveFocus();
  });

  it("Tab uvnitř palety focus neopustí (preventDefault), protože se navigovat má šipkami", () => {
    const input = openPalette();

    const tabEvent = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    input.dispatchEvent(tabEvent);

    expect(tabEvent.defaultPrevented).toBe(true);
  });
});
