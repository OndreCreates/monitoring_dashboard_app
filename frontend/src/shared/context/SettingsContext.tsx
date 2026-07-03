import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";

export type Theme = "light" | "dark" | "system";

interface SettingsContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  chartPoints: number;
  setChartPoints: (points: number) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function resolveIsDark(theme: Theme) {
  if (theme === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches;
  return theme === "dark";
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<Theme>("settings.theme", "system");
  const [chartPoints, setChartPoints] = useLocalStorage<number>("settings.chartPoints", 20);

  useEffect(() => {
    const apply = () => document.documentElement.classList.toggle("dark", resolveIsDark(theme));
    apply();

    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, chartPoints, setChartPoints }),
    [theme, setTheme, chartPoints, setChartPoints],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
}
