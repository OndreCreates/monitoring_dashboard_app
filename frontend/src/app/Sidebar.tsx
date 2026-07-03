import { NavLink } from "react-router-dom";
import { Activity, BellRing, History, LayoutDashboard, Server, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/app/ThemeToggle";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/services", label: "Services", icon: Server },
  { to: "/metrics", label: "Metrics", icon: Activity },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/events", label: "Events", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card px-3 py-4 transition-transform duration-200 md:static md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="mb-6 px-2 text-lg font-semibold tracking-tight">Monitoring Dashboard</div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
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
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="flex items-center justify-between border-t border-border px-2 pt-3">
        <span className="text-xs text-muted-foreground">Motiv</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
