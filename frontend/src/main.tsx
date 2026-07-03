import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { SettingsProvider } from "@/shared/context/SettingsContext";
import { ActiveAlertsProvider } from "@/shared/context/ActiveAlertsContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SettingsProvider>
      <ActiveAlertsProvider>
        <App />
      </ActiveAlertsProvider>
    </SettingsProvider>
  </StrictMode>,
);
