import { cn } from "@/lib/utils";
import { useSettings } from "@/shared/context/SettingsContext";
import { useActiveAlerts } from "@/shared/hooks/useActiveAlerts";

export function WorkspaceCard() {
  const { appName, accentColor } = useSettings();
  const { activeCount } = useActiveAlerts();
  const initial = appName.trim().charAt(0).toUpperCase() || "M";
  const hasActiveAlerts = activeCount > 0;

  return (
    <div className="mb-4 flex items-center gap-3 px-2">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
        style={{ backgroundColor: accentColor }}
      >
        {initial}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold tracking-tight">{appName}</span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("size-1.5 rounded-full", hasActiveAlerts ? "bg-destructive" : "bg-emerald-500")} />
          {hasActiveAlerts ? `${activeCount} aktivní ${activeCount === 1 ? "alert" : "alerty"}` : "Vše v pořádku"}
        </span>
      </div>
    </div>
  );
}
