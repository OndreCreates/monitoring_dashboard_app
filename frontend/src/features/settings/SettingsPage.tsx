import { Monitor, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Select } from "@/shared/components/Select";
import { useSettings, type Theme } from "@/shared/context/SettingsContext";

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Světlý", icon: Sun },
  { value: "dark", label: "Tmavý", icon: Moon },
  { value: "system", label: "Podle systému", icon: Monitor },
];

const chartPointsOptions = [10, 20, 50, 100];

export function SettingsPage() {
  const { theme, setTheme, chartPoints, setChartPoints } = useSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nastavení</h1>
        <p className="text-sm text-muted-foreground">Vzhled a chování dashboardu — ukládá se lokálně v prohlížeči.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Vzhled</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={theme === value ? "default" : "outline"}
                onClick={() => setTheme(value)}
              >
                <Icon className="size-4" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Grafy</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex max-w-xs flex-col gap-1 text-sm">
            Počet bodů historie v grafu
            <Select
              value={chartPoints}
              onChange={(event) => setChartPoints(Number(event.target.value))}
            >
              {chartPointsOptions.map((points) => (
                <option key={points} value={points}>
                  {points}
                </option>
              ))}
            </Select>
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            Ovlivňuje grafy na Dashboardu i na stránce Metrics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
