import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ClipboardList, Users, Monitor, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useClients, useTasks, useEquipment } from "@/hooks/useData";

export function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: clients } = useClients();
  const { data: tasks } = useTasks();
  const { data: equipment } = useEquipment();

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const q = query.toLowerCase().trim();

  const results = q.length < 2 ? [] : [
    ...(clients || [])
      .filter((c) => c.company.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || (c.city || "").toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({ type: "client" as const, id: c.id, title: c.company, subtitle: c.name, icon: Users })),
    ...(tasks || [])
      .filter((t) => t.description.toLowerCase().includes(q) || (t as any).clients?.company?.toLowerCase().includes(q))
      .slice(0, 4)
      .map((t) => ({ type: "task" as const, id: t.id, title: t.description, subtitle: (t as any).clients?.company || "", icon: ClipboardList })),
    ...(equipment || [])
      .filter((e) => `${e.brand} ${e.model}`.toLowerCase().includes(q) || (e.serial_number || "").toLowerCase().includes(q) || (e as any).clients?.company?.toLowerCase().includes(q))
      .slice(0, 4)
      .map((e) => ({ type: "equipment" as const, id: e.id, title: `${e.brand} ${e.model}`, subtitle: `${e.type} · ${(e as any).clients?.company || ""}`, icon: Monitor })),
  ];

  const handleSelect = (result: typeof results[0]) => {
    setOpen(false);
    setQuery("");
    if (result.type === "client") navigate(`/clientes/${result.id}`);
    else if (result.type === "task") navigate("/tarefas");
    else if (result.type === "equipment") navigate("/equipamentos");
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/50 cursor-pointer hover:bg-muted transition-colors text-sm text-muted-foreground min-w-[200px]"
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Pesquisar...</span>
        <kbd className="hidden sm:inline-flex ml-auto items-center gap-0.5 rounded border bg-background px-1.5 py-0.5 text-xs text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      {open && (
        <div className="absolute top-0 left-0 right-0 z-50 sm:w-[400px]">
          <div className="bg-card border rounded-lg shadow-lg">
            <div className="flex items-center gap-2 p-3 border-b">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar clientes, tarefas, equipamentos..."
                className="border-0 p-0 h-auto focus-visible:ring-0 text-sm"
              />
              <button onClick={() => { setOpen(false); setQuery(""); }}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            {results.length > 0 && (
              <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                {results.map((r, i) => (
                  <button
                    key={`${r.type}-${r.id}-${i}`}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted text-left transition-colors"
                    onClick={() => handleSelect(r)}
                  >
                    <r.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {q.length >= 2 && results.length === 0 && (
              <p className="text-sm text-muted-foreground p-4 text-center">Sem resultados para "{query}"</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
