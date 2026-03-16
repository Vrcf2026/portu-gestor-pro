import { useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2, MessageSquare, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  useTaskChecklists, useChecklistTemplates, useApplyTemplate,
  useToggleChecklistItem, useDeleteTaskChecklist,
} from "@/hooks/useChecklists";
import { useToast } from "@/hooks/use-toast";

interface Props {
  taskId: string;
}

export function TaskChecklistPanel({ taskId }: Props) {
  const { toast } = useToast();
  const { data: checklists, isLoading } = useTaskChecklists(taskId);
  const { data: templates } = useChecklistTemplates();
  const applyTemplate = useApplyTemplate();
  const toggleItem = useToggleChecklistItem();
  const deleteChecklist = useDeleteTaskChecklist();
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [noteEditing, setNoteEditing] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");

  const handleApply = async () => {
    if (!selectedTemplate) return;
    try {
      await applyTemplate.mutateAsync({ taskId, templateId: selectedTemplate });
      setSelectedTemplate("");
      toast({ title: "Checklist aplicada!" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleToggle = async (itemId: string, currentChecked: boolean) => {
    await toggleItem.mutateAsync({ id: itemId, checked: !currentChecked });
  };

  const handleSaveNote = async (itemId: string) => {
    await toggleItem.mutateAsync({ id: itemId, checked: true, notes: noteValue });
    setNoteEditing(null);
    setNoteValue("");
  };

  if (isLoading) return <Skeleton className="h-24" />;

  return (
    <div className="space-y-4">
      {/* Apply template */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Aplicar template de checklist..." />
            </SelectTrigger>
            <SelectContent>
              {templates?.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} <span className="text-muted-foreground ml-1">({t.category})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={handleApply} disabled={!selectedTemplate || applyTemplate.isPending}>
          <Plus className="h-3 w-3 mr-1" /> Aplicar
        </Button>
      </div>

      {/* Checklists */}
      {checklists?.map((cl) => {
        const items = (cl.task_checklist_items || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
        const done = items.filter((i: any) => i.checked).length;
        const total = items.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        return (
          <div key={cl.id} className="border rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{cl.name}</span>
                <Badge variant="outline" className="text-xs">
                  {done}/{total}
                </Badge>
              </div>
              <Button
                variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => { if (confirm("Remover esta checklist?")) deleteChecklist.mutate(cl.id); }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Progress value={pct} className="h-1.5" />

            <div className="space-y-1">
              {items.map((item: any) => (
                <div key={item.id} className="group flex items-start gap-2 py-1">
                  <button
                    className="mt-0.5 shrink-0"
                    onClick={() => handleToggle(item.id, item.checked)}
                  >
                    {item.checked ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                      {item.label}
                    </span>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground italic mt-0.5">{item.notes}</p>
                    )}
                    {noteEditing === item.id && (
                      <div className="flex gap-1 mt-1">
                        <Input
                          value={noteValue}
                          onChange={(e) => setNoteValue(e.target.value)}
                          placeholder="Nota..."
                          className="h-7 text-xs"
                        />
                        <Button size="sm" className="h-7 text-xs" onClick={() => handleSaveNote(item.id)}>
                          OK
                        </Button>
                      </div>
                    )}
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                    onClick={() => { setNoteEditing(item.id); setNoteValue(item.notes || ""); }}
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {(!checklists || checklists.length === 0) && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Nenhuma checklist aplicada. Selecione um template acima.
        </p>
      )}
    </div>
  );
}
