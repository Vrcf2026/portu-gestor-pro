import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useClients, useCreateTask, useUpdateTask, useDeleteTask, type Task, statusLabels, priorityLabels } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { TaskChecklistPanel } from "@/components/TaskChecklistPanel";
import { Separator } from "@/components/ui/separator";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: (Task & { clients?: { company: string } | null }) | null;
}

export function TaskFormDialog({ open, onOpenChange, task }: TaskFormDialogProps) {
  const { toast } = useToast();
  const { data: clients } = useClients();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const isEditing = !!task;

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      client_id: "",
      description: "",
      priority: "media",
      status: "novo",
      expected_date: "",
      notes: "",
    },
  });

  // Sync form with task prop
  useEffect(() => {
    if (task) {
      reset({
        client_id: task.client_id || "",
        description: task.description || "",
        priority: task.priority || "media",
        status: task.status || "novo",
        expected_date: task.expected_date || "",
        notes: task.notes || "",
      });
    } else {
      reset({
        client_id: "",
        description: "",
        priority: "media",
        status: "novo",
        expected_date: "",
        notes: "",
      });
    }
  }, [task, reset]);

  const priority = watch("priority");
  const status = watch("status");

  const onSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        expected_date: values.expected_date || null,
      };

      if (isEditing && task) {
        await updateTask.mutateAsync({ id: task.id, ...payload });
        toast({ title: "Tarefa atualizada!" });
      } else {
        await createTask.mutateAsync(payload);
        toast({ title: "Tarefa criada!" });
      }
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm("Eliminar esta tarefa?")) return;
    try {
      await deleteTask.mutateAsync(task.id);
      toast({ title: "Tarefa eliminada." });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={watch("client_id")} onValueChange={(v) => setValue("client_id", v)}>
              <SelectTrigger><SelectValue placeholder="Selecionar cliente" /></SelectTrigger>
              <SelectContent>
                {clients?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea {...register("description", { required: true })} placeholder="Descreva a tarefa..." rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setValue("priority", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={(v) => setValue("status", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prazo</Label>
            <Input {...register("expected_date")} type="date" />
          </div>

          <div className="space-y-2">
            <Label>Notas internas</Label>
            <Textarea {...register("notes")} placeholder="Notas..." rows={2} />
          </div>

          {isEditing && task && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Checklists</Label>
                <TaskChecklistPanel taskId={task.id} />
              </div>
            </>
          )}

          <div className="flex justify-between pt-2">
            <div>
              {isEditing && (
                <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
                  Eliminar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {isSubmitting ? "A guardar..." : isEditing ? "Guardar" : "Criar Tarefa"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
