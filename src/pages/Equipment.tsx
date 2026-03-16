import { useState } from "react";
import { Search, Plus, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { equipment, clients } from "@/data/mockData";

export default function Equipment() {
  const [search, setSearch] = useState("");

  const getClientName = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.company || "—";

  const filtered = equipment.filter(
    (e) =>
      e.brand.toLowerCase().includes(search.toLowerCase()) ||
      e.model.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase()) ||
      getClientName(e.clientId).toLowerCase().includes(search.toLowerCase())
  );

  const isWarrantyNearEnd = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
  };

  const isWarrantyExpired = (date: string) => new Date(date) < new Date();

  const typeIcon: Record<string, string> = {
    PC: "💻",
    NAS: "🗄️",
    Router: "📡",
    Switch: "🔀",
    CCTV: "📹",
    Servidor: "🖥️",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Equipamentos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {equipment.length} equipamentos registados
          </p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="h-4 w-4 mr-1" /> Novo Equipamento
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar equipamentos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((eq) => {
          const nearEnd = isWarrantyNearEnd(eq.warrantyEnd);
          const expired = isWarrantyExpired(eq.warrantyEnd);

          return (
            <Card
              key={eq.id}
              className={`border hover:shadow-md transition-shadow cursor-pointer ${
                expired ? "border-l-4 border-l-destructive" : nearEnd ? "border-l-4 border-l-warning" : ""
              }`}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{typeIcon[eq.type] || "📦"}</span>
                    <div>
                      <h3 className="font-display font-semibold text-sm">
                        {eq.brand} {eq.model}
                      </h3>
                      <p className="text-xs text-muted-foreground">{eq.type}</p>
                    </div>
                  </div>
                  {expired ? (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Expirada
                    </Badge>
                  ) : nearEnd ? (
                    <Badge className="text-xs bg-warning text-warning-foreground">
                      <AlertTriangle className="h-3 w-3 mr-1" /> A expirar
                    </Badge>
                  ) : null}
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium text-foreground">Cliente:</span>{" "}
                    {getClientName(eq.clientId)}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">S/N:</span>{" "}
                    {eq.serialNumber}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Instalado:</span>{" "}
                    {new Date(eq.installDate).toLocaleDateString("pt-PT")}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Garantia até:</span>{" "}
                    {new Date(eq.warrantyEnd).toLocaleDateString("pt-PT")}
                  </p>
                  {eq.notes && <p className="italic mt-1">{eq.notes}</p>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum equipamento encontrado.</p>
        </div>
      )}
    </div>
  );
}
