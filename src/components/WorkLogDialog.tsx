import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Play, Square, Clock } from "lucide-react";
import { useClients, useTasks, useCreateWorkLog } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";

interface WorkLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultClientId?: string;
  defaultTaskId?: string;
}

export function WorkLogDialog({ open, onOpenChange, defaultClientId, defaultTaskId }: WorkLogDialogProps) {
  const { toast } = useToast();
  const { data: clients } = useClients();
  const { data: tasks } = useTasks();
  const createWorkLog = useCreateWorkLog();

  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      client_id: defaultClientId || "",
      task_id: defaultTaskId || "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      hours: 0,
      minutes: 0,
      hourly_rate: 0,
      deduct_from_contract: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        client_id: defaultClientId || "",
        task_id: defaultTaskId || "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        hours: 0,
        minutes: 0,
        hourly_rate: 0,
        deduct_from_contract: true,
      });
      setTimerSeconds(0);
      setTimerRunning(false);
      setTimerStartTime(null);
    }
  }, [open, defaultClientId, defaultTaskId, reset]);

  const clientId = watch("client_id");
  const clientTasks = tasks?.filter((t) => t.client_id === clientId && t.status !== "concluido" && t.status !== "faturado") || [];

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning && timerStartTime) {
      interval = setInterval(() => {
        setTimerSeconds(Math.floor((Date.now() - timerStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerStartTime]);

  const startTimer = useCallback(() => {
    setTimerStartTime(Date.now());
    setTimerSeconds(0);
    setTimerRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setTimerRunning(false);
    const totalMinutes = Math.ceil(timerSeconds / 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    setValue("hours", h);
    setValue("minutes", m);
  }, [timerSeconds, setValue]);

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const onSubmit = async (values: any) => {
    try {
      await createWorkLog.mutateAsync({
        client_id: values.client_id,
        task_id: values.task_id && values.task_id !== "none" ? values.task_id : null,
        description: values.description,
        date: values.date,
        hours: Number(values.hours),
        minutes: Number(values.minutes),
        hourly_rate: Number(values.hourly_rate) || null,
        deduct_from_contract: values.deduct_from_contract,
      });
      toast({ title: "Trabalho registado!" });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" /> Registar Trabalho
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={(v) => { setValue("client_id", v); setValue("task_id", ""); }}>
              <SelectTrigger><SelectValue placeholder="Selecionar cliente" /></SelectTrigger>
              <SelectContent>
                {clients?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {clientId && clientTasks.length > 0 && (
            <div className="space-y-2">
              <Label>Tarefa (opcional)</Label>
              <Select value={watch("task_id") || "none"} onValueChange={(v) => setValue("task_id", v)}>
                <SelectTrigger><SelectValue placeholder="Associar a uma tarefa" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem tarefa</SelectItem>
                  {clientTasks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Descrição do trabalho</Label>
            <Textarea {...register("description", { required: true })} placeholder="O que foi feito..." rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input {...register("date")} type="date" />
            </div>
            <div className="space-y-2">
              <Label>Taxa Horária (€)</Label>
              <Input {...register("hourly_rate")} type="number" min="0" step="0.01" placeholder="0.00" />
            </div>
          </div>

          {/* Timer */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <Label className="text-sm font-medium">Tempo</Label>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-display font-bold tracking-wider text-foreground">
                {formatTimer(timerSeconds)}
              </div>
              {!timerRunning ? (
                <Button type="button" size="sm" variant="outline" onClick={startTimer} className="gap-1">
                  <Play className="h-4 w-4" /> Iniciar
                </Button>
              ) : (
                <Button type="button" size="sm" variant="destructive" onClick={stopTimer} className="gap-1">
                  <Square className="h-4 w-4" /> Parar
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Ou insira manualmente:</p>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Input {...register("hours")} type="number" min="0" className="w-20" />
                <span className="text-sm text-muted-foreground">horas</span>
              </div>
              <div className="flex items-center gap-2">
                <Input {...register("minutes")} type="number" min="0" max="59" className="w-20" />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="deduct"
              checked={watch("deduct_from_contract")}
              onCheckedChange={(v) => setValue("deduct_from_contract", !!v)}
            />
            <Label htmlFor="deduct" className="text-sm cursor-pointer">
              Deduzir das horas contratadas
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || timerRunning} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isSubmitting ? "A guardar..." : "Registar Trabalho"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
