import { useState, useEffect, useCallback } from "react";
import { Play, Square, Clock, Check, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClients, useTasks, useCreateWorkLog } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";

export default function QuickEntryPage() {
  const { toast } = useToast();
  const { data: clients } = useClients();
  const { data: tasks } = useTasks();
  const createWorkLog = useCreateWorkLog();

  const [clientId, setClientId] = useState("");
  const [taskId, setTaskId] = useState("none");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [deduct, setDeduct] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recentEntries, setRecentEntries] = useState<Array<{ description: string; client: string; time: string }>>([]);

  // Timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);

  const clientTasks = tasks?.filter((t) => t.client_id === clientId && t.status !== "concluido" && t.status !== "faturado") || [];

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
    setHours(Math.floor(totalMinutes / 60));
    setMinutes(totalMinutes % 60);
  }, [timerSeconds]);

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (!clientId || !description.trim()) {
      toast({ title: "Campos obrigatórios", description: "Selecione um cliente e descreva o trabalho.", variant: "destructive" });
      return;
    }
    if (hours === 0 && minutes === 0) {
      toast({ title: "Tempo obrigatório", description: "Insira o tempo ou use o timer.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await createWorkLog.mutateAsync({
        client_id: clientId,
        task_id: taskId !== "none" ? taskId : null,
        description: description.trim(),
        date,
        hours,
        minutes,
        hourly_rate: hourlyRate || null,
        deduct_from_contract: deduct,
      });
      const clientName = clients?.find((c) => c.id === clientId)?.company || "";
      setRecentEntries((prev) => [{ description: description.trim(), client: clientName, time: `${hours}h${minutes > 0 ? `${minutes}m` : ""}` }, ...prev.slice(0, 4)]);
      toast({ title: "✓ Trabalho registado!" });
      // Reset for next entry
      setDescription("");
      setHours(0);
      setMinutes(0);
      setTimerSeconds(0);
      setTimerRunning(false);
      setTimerStartTime(null);
      setTaskId("none");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-fill hourly rate from client's contract
  useEffect(() => {
    if (clientId) {
      const client = clients?.find((c) => c.id === clientId);
      if (client) {
        // Try to set a sensible default - keep existing if already set
      }
    }
  }, [clientId, clients]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-accent" /> Registo Rápido
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Registar trabalho de forma ultra-rápida</p>
      </div>

      <Card className="border">
        <CardContent className="p-6 space-y-5">
          {/* Client & Task row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-medium">Cliente *</Label>
              <Select value={clientId} onValueChange={(v) => { setClientId(v); setTaskId("none"); }}>
                <SelectTrigger><SelectValue placeholder="Selecionar cliente..." /></SelectTrigger>
                <SelectContent>
                  {clients?.map((c) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Tarefa (opcional)</Label>
              <Select value={taskId} onValueChange={setTaskId} disabled={!clientId}>
                <SelectTrigger><SelectValue placeholder="Associar tarefa..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem tarefa</SelectItem>
                  {clientTasks.map((t) => <SelectItem key={t.id} value={t.id}>{t.description}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="font-medium">Descrição *</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="O que foi feito..." rows={2} className="resize-none" />
          </div>

          {/* Timer section */}
          <div className="bg-muted/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-medium text-base">Tempo</Label>
              {!timerRunning ? (
                <Button type="button" size="sm" onClick={startTimer} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1">
                  <Play className="h-4 w-4" /> Iniciar Timer
                </Button>
              ) : (
                <Button type="button" size="sm" variant="destructive" onClick={stopTimer} className="gap-1">
                  <Square className="h-4 w-4" /> Parar
                </Button>
              )}
            </div>

            {(timerRunning || timerSeconds > 0) && (
              <div className="text-center">
                <p className="text-4xl font-display font-bold tracking-wider text-foreground">
                  {formatTimer(timerSeconds)}
                </p>
                {timerRunning && <p className="text-xs text-accent mt-1 animate-pulse">Timer a correr...</p>}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Input type="number" min="0" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-20" />
                <span className="text-sm text-muted-foreground">horas</span>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="w-20" />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            </div>
          </div>

          {/* Date & Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-medium">Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Taxa (€/h)</Label>
              <Input type="number" min="0" step="0.01" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} placeholder="0.00" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="deduct-quick" checked={deduct} onCheckedChange={(v) => setDeduct(!!v)} />
            <Label htmlFor="deduct-quick" className="text-sm cursor-pointer">Deduzir das horas contratadas</Label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || timerRunning || !clientId || !description.trim()}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-display"
          >
            {submitting ? "A guardar..." : (
              <><Check className="h-5 w-5 mr-2" /> Registar Trabalho</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent entries */}
      {recentEntries.length > 0 && (
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display text-muted-foreground">Registos desta sessão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentEntries.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-success/5">
                <Check className="h-4 w-4 text-success shrink-0" />
                <span className="font-medium">{entry.client}</span>
                <span className="text-muted-foreground truncate flex-1">{entry.description}</span>
                <span className="text-muted-foreground shrink-0">{entry.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
