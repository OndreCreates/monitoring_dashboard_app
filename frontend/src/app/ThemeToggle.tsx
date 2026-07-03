import { Moon, Sun } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { useSettings } from "@/shared/context/SettingsContext";

export function ThemeToggle() {
  const { theme, setTheme } = useSettings();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Přepnout na světlý motiv" : "Přepnout na tmavý motiv"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
