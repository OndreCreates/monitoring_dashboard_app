import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/app/Sidebar";
import { Button } from "@/shared/components/Button";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <button
          aria-label="Zavřít navigaci"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 md:hidden">
          <Button variant="ghost" size="icon" aria-label="Otevřít navigaci" onClick={() => setSidebarOpen(true)}>
            <Menu className="size-5" />
          </Button>
          <span className="text-base font-semibold tracking-tight">Monitoring Dashboard</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
