import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServicesPage } from "./ServicesPage";
import * as servicesApi from "@/api/services";

vi.mock("@/api/services");

const mockedApi = vi.mocked(servicesApi);

function renderPage() {
  return render(
    <MemoryRouter>
      <ServicesPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  mockedApi.fetchServices.mockResolvedValue([]);
});

describe("ServicesPage", () => {
  it("zobrazí zprávu, když zatím není registrovaná žádná služba", async () => {
    renderPage();

    expect(await screen.findByText("Zatím žádná registrovaná služba.")).toBeInTheDocument();
  });

  it("nezavolá createService, pokud jsou pole prázdná", async () => {
    renderPage();
    await waitFor(() => expect(mockedApi.fetchServices).toHaveBeenCalledTimes(1));

    await userEvent.setup().click(screen.getByRole("button", { name: "Přidat službu" }));

    expect(mockedApi.createService).not.toHaveBeenCalled();
  });

  it("zobrazí hlášku z backendu, když se přidání služby nezdaří (např. duplicitní název)", async () => {
    mockedApi.createService.mockRejectedValue(new Error("Služba s tímto názvem už existuje."));
    renderPage();
    await waitFor(() => expect(mockedApi.fetchServices).toHaveBeenCalledTimes(1));

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("např. payments-api"), "demo-service-a");
    await user.type(
      screen.getByPlaceholderText("http://demo-service-a:8081/actuator/health"),
      "http://test:8080/actuator/health",
    );
    await user.click(screen.getByRole("button", { name: "Přidat službu" }));

    expect(await screen.findByText("Služba s tímto názvem už existuje.")).toBeInTheDocument();
  });

  it("po úspěšném přidání vyčistí formulář a znovu načte seznam služeb", async () => {
    mockedApi.createService.mockResolvedValue({
      id: 1,
      name: "demo-service-a",
      url: "http://test:8080/actuator/health",
      createdAt: new Date().toISOString(),
      tags: [],
    });
    renderPage();
    await waitFor(() => expect(mockedApi.fetchServices).toHaveBeenCalledTimes(1));

    const user = userEvent.setup();
    const nameInput = screen.getByPlaceholderText("např. payments-api");
    await user.type(nameInput, "demo-service-a");
    await user.type(
      screen.getByPlaceholderText("http://demo-service-a:8081/actuator/health"),
      "http://test:8080/actuator/health",
    );
    await user.click(screen.getByRole("button", { name: "Přidat službu" }));

    await waitFor(() => expect(mockedApi.fetchServices).toHaveBeenCalledTimes(2));
    expect(nameInput).toHaveValue("");
    expect(mockedApi.createService).toHaveBeenCalledWith({
      name: "demo-service-a",
      url: "http://test:8080/actuator/health",
      tags: [],
    });
  });
});
