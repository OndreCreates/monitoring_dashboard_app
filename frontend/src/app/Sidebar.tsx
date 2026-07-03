import { NavLink } from "react-router-dom";
import { Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/app/ThemeToggle";
import { WorkspaceCard } from "@/app/WorkspaceCard";
import { navItems } from "@/app/navItems";
import { useActiveAlerts } from "@/shared/hooks/useActiveAlerts";

// Settings lives in the bottom row next to the theme toggle, not in the main list —
// still included in navItems itself so the command palette can still find/navigate to it.
const mainNavItems = navItems.filter((item) => item.to !== "/settings");

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const { activeCount } = useActiveAlerts();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card px-3 py-4 transition-transform duration-200 md:static md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <WorkspaceCard />
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
        className="mb-4 flex items-center justify-between rounded-md border border-border px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <span className="flex items-center gap-2">
          <Search className="size-4" />
          Hledat…
        </span>
        <kbd className="rounded border border-border px-1.5 py-0.5 text-xs">⌘K</kbd>
      </button>
      <nav className="flex flex-1 flex-col gap-1">
        {mainNavItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground",
              )
            }
          >
            <Icon className="size-4" />
            <span className="flex-1">{label}</span>
            {label === "Alerts" && activeCount > 0 && (
              <span className="rounded-full bg-destructive px-1.5 py-0.5 text-xs font-semibold text-white">
                {activeCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="flex items-center justify-between border-t border-border px-2 pt-3">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground",
            )
          }
        >
          <Settings className="size-4" />
          Settings
        </NavLink>
        <ThemeToggle />
      </div>
    </aside>
  );
}
