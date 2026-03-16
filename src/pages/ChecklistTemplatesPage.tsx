import { useState } from "react";
import { Plus, Trash2, ListChecks } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChecklistTemplates, useCreateChecklistTemplate, useDeleteChecklistTemplate } from "@/hooks/useChecklists";
import { useToast } from "@/hooks/use-toast";
import { Constants } from "@/integrations/supabase/types";

const categories = ["geral", "manutenção", "instalação", "backup", "rede", "segurança"];

export default function ChecklistTemplatesPage() {
  const { toast } = useToast();
  const { data: templates, isLoading } = useChecklistTemplates();
  const createTemplate = useCreateChecklistTemplate();
  const deleteTemplate = useDeleteChecklistTemplate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("geral");
  const [equipmentType, setEquipmentType] = useState("");
  const [items, setItems] = useState<string[]>([""]);

  const handleAddItem = () => setItems([...items, ""]);
  const handleItemChange = (i: number, val: string) => {
    const copy = [...items];
    copy[i] = val;
    setItems(copy);
  };
  const handleRemoveItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const handleCreate = async () => {
    const filtered = items.filter((i) => i.trim());
    if (!name.trim() || filtered.length === 0) {
      toast({ title: "Preencha o nome e pelo menos 1 item.", variant: "destructive" });
      return;
    }
    try {
      await createTemplate.mutateAsync({
        name: name.trim(),
        category,
        equipment_type: equipmentType || undefined,
        items: filtered,
      });
      toast({ title: "Template criado!" });
      setDialogOpen(false);
      setName("");
      setCategory("geral");
      setEquipmentType("");
      setItems([""]);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este template?")) return;
    try {
      await deleteTemplate.mutateAsync(id);
      toast({ title: "Template eliminado." });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Checklists</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Templates reutilizáveis para tarefas e equipamentos
          </p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Novo Template
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates?.map((t) => {
            const itemsList = (t.checklist_template_items || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
            return (
              <Card key={t.id} className="border hover:shadow-sm transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-primary" />
                      <h3 className="font-medium text-sm">{t.name}</h3>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">{t.category}</Badge>
                    {t.equipment_type && <Badge variant="outline" className="text-xs">{t.equipment_type}</Badge>}
                  </div>
                  <ul className="space-y-1">
                    {itemsList.map((item: any) => (
                      <li key={item.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
          {(!templates || templates.length === 0) && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p>Nenhum template criado.</p>
            </div>
          )}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Novo Template de Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Manutenção trimestral servidor" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo Equipamento (opcional)</Label>
                <Select value={equipmentType} onValueChange={setEquipmentType}>
                  <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {Constants.public.Enums.equipment_type.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Itens da checklist</Label>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleItemChange(i, e.target.value)}
                      placeholder={`Item ${i + 1}...`}
                      className="text-sm"
                    />
                    {items.length > 1 && (
                      <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveItem(i)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-3 w-3 mr-1" /> Adicionar Item
              </Button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={createTemplate.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {createTemplate.isPending ? "A criar..." : "Criar Template"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
