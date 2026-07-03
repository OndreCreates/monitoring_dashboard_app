import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServices } from "@/shared/hooks/useServices";
import { navItems } from "@/app/navItems";

interface PaletteItem {
  key: string;
  label: string;
  sublabel?: string;
  searchText: string;
  to: string;
  icon: typeof Server;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { services } = useServices();

  const items = useMemo<PaletteItem[]>(() => {
    const pages = navItems.map((item) => ({
      key: `page-${item.to}`,
      label: item.label,
      searchText: item.label,
      to: item.to,
      icon: item.icon,
    }));
    const serviceItems = services.map((service) => ({
      key: `service-${service.id}`,
      label: service.name,
      sublabel: service.url,
      searchText: [service.name, service.url, ...service.tags].join(" "),
      to: `/services/${service.id}`,
      icon: Server,
    }));
    return [...pages, ...serviceItems];
  }, [services]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized === "") return items;
    return items.filter((item) => item.searchText.toLowerCase().includes(normalized));
  }, [items, query]);

  function openPalette() {
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  }

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => {
          if (prev) return false;
          openPalette();
          return true;
        });
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    window.addEventListener("open-command-palette", openPalette);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      window.removeEventListener("open-command-palette", openPalette);
    };
  }, []);

  useEffect(() => {
    // Portal-free overlay mounts synchronously with `open`, so the input exists by now —
    // this only moves focus, it doesn't set any React state.
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  function select(item: PaletteItem) {
    navigate(item.to);
    setOpen(false);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setActiveIndex(0);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && filtered[activeIndex]) {
      select(filtered[activeIndex]);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-24" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-card shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hledat stránku nebo službu…"
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        <ul className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">Nic nenalezeno.</li>
          ) : (
            filtered.map((item, index) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => select(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm",
                    index === activeIndex ? "bg-accent text-accent-foreground" : "text-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex flex-col">
                    <span className="font-medium">{item.label}</span>
                    {item.sublabel && <span className="text-xs text-muted-foreground">{item.sublabel}</span>}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
