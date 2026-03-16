import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks, useDeleteTask, statusLabels, priorityLabels } from "@/hooks/useData";
import { TaskFormDialog } from "@/components/TaskFormDialog";
import { useToast } from "@/hooks/use-toast";

export default function Tasks() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [priorityFilter, setPriorityFilter] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const { data: tasks, isLoading } = useTasks();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();

  const today = new Date().toISOString().split("T")[0];

  const filtered = (tasks || []).filter((t) => {
    const matchSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      ((t as any).clients?.company || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || t.status === statusFilter;
    const matchPriority = priorityFilter === "todos" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const priorityColor = (p: string) => {
    if (p === "alta") return "bg-destructive/15 text-destructive border-destructive/30";
    if (p === "media") return "bg-warning/15 text-warning-foreground border-warning/30";
    return "bg-muted text-muted-foreground border-border";
  };

  const statusColor = (s: string) => {
    if (s === "concluido" || s === "faturado") return "bg-success/15 text-success border-success/30";
    if (s === "em_progresso") return "bg-primary/15 text-primary border-primary/30";
    if (s === "aguarda_pecas" || s === "aguarda_cliente") return "bg-warning/15 text-warning-foreground border-warning/30";
    return "bg-muted text-muted-foreground border-border";
  };

  const activeCount = (tasks || []).filter((t) => t.status !== "concluido" && t.status !== "faturado").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Tarefas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {tasks?.length || 0} tarefas · {activeCount} ativas
          </p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => { setEditingTask(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Nova Tarefa
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar tarefas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os estados</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            {Object.entries(priorityLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => {
            const isOverdue = task.expected_date && task.expected_date < today && task.status !== "concluido" && task.status !== "faturado";

            return (
              <Card
                key={task.id}
                className={`border hover:shadow-sm transition-shadow cursor-pointer ${isOverdue ? "border-l-4 border-l-destructive" : ""}`}
                onClick={() => { setEditingTask(task); setDialogOpen(true); }}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">{task.description}</h3>
                        {isOverdue && <Badge variant="destructive" className="text-xs shrink-0">Atrasada</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(task as any).clients?.company || "—"} · Criada: {new Date(task.created_at).toLocaleDateString("pt-PT")}
                        {task.expected_date && <> · Prazo: {new Date(task.expected_date).toLocaleDateString("pt-PT")}</>}
                      </p>
                      {task.notes && <p className="text-xs text-muted-foreground mt-1 italic truncate">{task.notes}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Badge variant="outline" className={`text-xs ${priorityColor(task.priority)}`}>{priorityLabels[task.priority]}</Badge>
                      <Badge variant="outline" className={`text-xs ${statusColor(task.status)}`}>{statusLabels[task.status]}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><p>Nenhuma tarefa encontrada.</p></div>}
        </div>
      )}

      <TaskFormDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editingTask} />
    </div>
  );
}
