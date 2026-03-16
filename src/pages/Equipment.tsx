import { useState } from "react";
import { Search, Plus, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEquipment, useDeleteEquipment } from "@/hooks/useData";
import { EquipmentFormDialog } from "@/components/EquipmentFormDialog";
import { useToast } from "@/hooks/use-toast";

export default function Equipment() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const { data: equipment, isLoading } = useEquipment();
  const deleteEquipment = useDeleteEquipment();
  const { toast } = useToast();

  const today = new Date().toISOString().split("T")[0];

  const filtered = (equipment || []).filter(
    (e) =>
      e.brand.toLowerCase().includes(search.toLowerCase()) ||
      e.model.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase()) ||
      ((e as any).clients?.company || "").toLowerCase().includes(search.toLowerCase())
  );

  const isWarrantyNearEnd = (date: string | null) => {
    if (!date) return false;
    const diff = new Date(date).getTime() - Date.now();
    return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
  };

  const isWarrantyExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const typeIcon: Record<string, string> = {
    PC: "💻", NAS: "🗄️", Router: "📡", Switch: "🔀", CCTV: "📹", Servidor: "🖥️",
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminar "${name}"?`)) return;
    try {
      await deleteEquipment.mutateAsync(id);
      toast({ title: "Equipamento eliminado." });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Equipamentos</h1>
          <p className="text-muted-foreground text-sm mt-1">{equipment?.length || 0} equipamentos registados</p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => { setEditingEquipment(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Novo Equipamento
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Pesquisar equipamentos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((eq) => {
            const nearEnd = isWarrantyNearEnd(eq.warranty_end);
            const expired = isWarrantyExpired(eq.warranty_end);

            return (
              <Card key={eq.id} className={`border hover:shadow-md transition-shadow ${expired ? "border-l-4 border-l-destructive" : nearEnd ? "border-l-4 border-l-warning" : ""}`}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{typeIcon[eq.type] || "📦"}</span>
                      <div>
                        <h3 className="font-display font-semibold text-sm">{eq.brand} {eq.model}</h3>
                        <p className="text-xs text-muted-foreground">{eq.type}</p>
                      </div>
                    </div>
                    {expired ? (
                      <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" /> Expirada</Badge>
                    ) : nearEnd ? (
                      <Badge className="text-xs bg-warning text-warning-foreground"><AlertTriangle className="h-3 w-3 mr-1" /> A expirar</Badge>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><span className="font-medium text-foreground">Cliente:</span> {(eq as any).clients?.company || "—"}</p>
                    {eq.serial_number && <p><span className="font-medium text-foreground">S/N:</span> {eq.serial_number}</p>}
                    {eq.install_date && <p><span className="font-medium text-foreground">Instalado:</span> {new Date(eq.install_date).toLocaleDateString("pt-PT")}</p>}
                    {eq.warranty_end && <p><span className="font-medium text-foreground">Garantia até:</span> {new Date(eq.warranty_end).toLocaleDateString("pt-PT")}</p>}
                    {eq.notes && <p className="italic mt-1">{eq.notes}</p>}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingEquipment(eq); setDialogOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(eq.id, `${eq.brand} ${eq.model}`)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground"><p>Nenhum equipamento encontrado.</p></div>
      )}

      <EquipmentFormDialog open={dialogOpen} onOpenChange={setDialogOpen} equipment={editingEquipment} />
    </div>
  );
}
