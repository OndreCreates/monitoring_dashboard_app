import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { SettingsProvider } from "@/shared/context/SettingsContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>,
);
