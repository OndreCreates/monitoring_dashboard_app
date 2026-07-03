import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Select } from "@/shared/components/Select";
import { cn } from "@/lib/utils";
import { useSettings, type Theme, ACCENT_COLORS } from "@/shared/context/SettingsContext";
import { fetchSystemInfo } from "@/api/system";
import type { SystemInfoResponse } from "@/api/types";

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Světlý", icon: Sun },
  { value: "dark", label: "Tmavý", icon: Moon },
  { value: "system", label: "Podle systému", icon: Monitor },
];

const chartPointsOptions = [10, 20, 50, 100];

export function SettingsPage() {
  const { theme, setTheme, chartPoints, setChartPoints, appName, setAppName, accentColor, setAccentColor } =
    useSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nastavení</h1>
        <p className="text-sm text-muted-foreground">Vzhled a chování dashboardu — ukládá se lokálně v prohlížeči.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Branding</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label className="flex max-w-xs flex-col gap-1 text-sm">
            Název appky
            <Input value={appName} onChange={(event) => setAppName(event.target.value)} maxLength={40} />
          </label>
          <div className="flex flex-col gap-1 text-sm">
            Barva
            <div className="flex gap-2">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Zvolit barvu ${color}`}
                  onClick={() => setAccentColor(color)}
                  className={cn(
                    "size-7 rounded-full ring-offset-2 ring-offset-background transition-shadow",
                    accentColor === color && "ring-2 ring-foreground",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

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

      <SystemInfoCard />
    </div>
  );
}

function SystemInfoCard() {
  const [info, setInfo] = useState<SystemInfoResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSystemInfo().then((data) => {
      if (!cancelled) setInfo(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = info
    ? [
        { label: "Interval sběru metrik", value: `${info.pollIntervalMs / 1000} s` },
        { label: "Retence metrik", value: `${info.metricsRetentionDays} dní` },
        { label: "Retence událostí", value: `${info.eventsRetentionDays} dní` },
      ]
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">O aplikaci</CardTitle>
      </CardHeader>
      <CardContent>
        {info === null ? (
          <p className="text-sm text-muted-foreground">Načítám…</p>
        ) : (
          <dl className="flex flex-col gap-2 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="mt-3 text-xs text-muted-foreground">Aktuální hodnoty z backendu — nikdy nezastarají.</p>
      </CardContent>
    </Card>
  );
}
