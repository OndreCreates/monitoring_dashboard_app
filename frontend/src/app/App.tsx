import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ServicesPage } from "@/features/services/ServicesPage";
import { MetricsPage } from "@/features/metrics/MetricsPage";
import { AlertsPage } from "@/features/alerts/AlertsPage";
import { EventsPage } from "@/features/events/EventsPage";
import { SettingsPage } from "@/features/settings/SettingsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "services", element: <ServicesPage /> },
      { path: "metrics", element: <MetricsPage /> },
      { path: "alerts", element: <AlertsPage /> },
      { path: "events", element: <EventsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
