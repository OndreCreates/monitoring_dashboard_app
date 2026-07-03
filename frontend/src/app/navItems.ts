import { Activity, BellRing, History, LayoutDashboard, Server, Settings } from "lucide-react";

export const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/services", label: "Services", icon: Server },
  { to: "/metrics", label: "Metrics", icon: Activity },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/events", label: "Events", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];
