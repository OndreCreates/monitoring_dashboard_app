import { NavLink } from "react-router-dom";
import { Activity, BellRing, History, LayoutDashboard, Server } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/services", label: "Services", icon: Server },
  { to: "/metrics", label: "Metrics", icon: Activity },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/events", label: "Events", icon: History },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card px-3 py-4">
      <div className="mb-6 px-2 text-lg font-semibold tracking-tight">Monitoring Dashboard</div>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
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
    </aside>
  );
}
