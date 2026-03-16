import { useState } from "react";
import {
  ClipboardList, Clock, AlertTriangle, CalendarCheck, Users, Plus, Timer, UserPlus,
  TrendingUp, TrendingDown, DollarSign, Bell, FileText, ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClients, useTasks, useContracts, statusLabels, priorityLabels } from "@/hooks/useData";
import { useNavigate } from "react-router-dom";
import { TaskFormDialog } from "@/components/TaskFormDialog";
import { ClientFormDialog } from "@/components/ClientFormDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkLogDialog } from "@/components/WorkLogDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: tasks, isLoading: loadingTasks } = useTasks();
  const { data: contracts } = useContracts();
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showWorkLog, setShowWorkLog] = useState(false);

  const { data: workLogs } = useQuery({
    queryKey: ["work_logs_dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase.from("work_logs").select("*, clients(company)").order("date", { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: equipment } = useQuery({
    queryKey: ["equipment_dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase.from("equipment").select("*, clients(company)").order("warranty_end");
      if (error) throw error;
      return data;
    },
  });

  const today = new Date().toISOString().split("T")[0];
  const soon30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const soon90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const pendingTasks = tasks?.filter((t) => t.status === "pendente") || [];
  const inProgressTasks = tasks?.filter((t) => t.status === "em_progresso") || [];
  const overdueTasks = tasks?.filter(
    (t) => t.expected_date && t.expected_date < today && t.status !== "concluido" && t.status !== "faturado"
  ) || [];
  const todayTasks = tasks?.filter((t) => t.expected_date === today) || [];
  const activeContracts = clients?.filter((c) => c.contracted_hours !== null) || [];

  // Alerts
  const lowHoursContracts = (contracts || []).filter((c) => c.active && c.hours > 0 && ((c.used_hours / c.hours) * 100) > 85);
  const expiringContracts = (contracts || []).filter((c) => c.active && c.end_date >= today && c.end_date <= soon30);
  const warrantyAlerts = (equipment || []).filter((eq) => eq.warranty_end && eq.warranty_end >= today && eq.warranty_end <= soon90);

  // Profitability per client
  const profitability = (clients || []).map((c) => {
    const logs = (workLogs || []).filter((l) => l.client_id === c.id);
    const totalHours = logs.reduce((sum, l) => sum + l.hours + l.minutes / 60, 0);
    const totalBilled = logs.reduce((sum, l) => sum + (l.hours + l.minutes / 60) * (l.hourly_rate || 0), 0);
    return { id: c.id, company: c.company, totalHours: Math.round(totalHours * 10) / 10, totalBilled: Math.round(totalBilled * 100) / 100 };
  }).filter((c) => c.totalHours > 0).sort((a, b) => b.totalBilled - a.totalBilled);

  const totalAlerts = overdueTasks.length + lowHoursContracts.length + expiringContracts.length + warrantyAlerts.length;

  const stats = [
    { label: "Tarefas Pendentes", value: pendingTasks.length, icon: ClipboardList, color: "text-accent", bg: "bg-accent/10", link: "/tarefas" },
    { label: "Em Progresso", value: inProgressTasks.length, icon: Clock, color: "text-primary", bg: "bg-primary/10", link: "/tarefas" },
    { label: "Atrasadas", value: overdueTasks.length, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", link: "/tarefas" },
    { label: "Para Hoje", value: todayTasks.length, icon: CalendarCheck, color: "text-success", bg: "bg-success/10", link: "/calendario" },
  ];

  const priorityColor = (p: string) => {
    if (p === "alta") return "bg-destructive/15 text-destructive border-destructive/30";
    if (p === "media") return "bg-warning/15 text-warning-foreground border-warning/30";
    return "bg-muted text-muted-foreground border-border";
  };

  const isLoading = loadingClients || loadingTasks;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visão geral — {new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setShowNewTask(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova Tarefa
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowWorkLog(true)}>
            <Timer className="h-4 w-4 mr-1" /> Registar Trabalho
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowNewClient(true)}>
            <UserPlus className="h-4 w-4 mr-1" /> Novo Cliente
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/registo-rapido")}>
            <Clock className="h-4 w-4 mr-1" /> Registo Rápido
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(s.link)}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`${s.bg} ${s.color} p-2.5 rounded-lg`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                {isLoading ? <Skeleton className="h-8 w-8" /> : <p className="text-2xl font-display font-bold">{s.value}</p>}
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts banner */}
      {totalAlerts > 0 && (
        <Card className="border border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <Bell className="h-4 w-4 text-warning" /> Alertas ({totalAlerts})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueTasks.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="destructive" className="text-xs">{overdueTasks.length}</Badge>
                <span>tarefas atrasadas</span>
                <Button size="sm" variant="link" className="text-xs p-0 h-auto" onClick={() => navigate("/tarefas")}>Ver →</Button>
              </div>
            )}
            {lowHoursContracts.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Badge className="text-xs bg-warning text-warning-foreground">{lowHoursContracts.length}</Badge>
                <span>contratos com horas baixas (&gt;85% utilizadas)</span>
                <Button size="sm" variant="link" className="text-xs p-0 h-auto" onClick={() => navigate("/contratos")}>Ver →</Button>
              </div>
            )}
            {expiringContracts.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Badge className="text-xs bg-warning text-warning-foreground">{expiringContracts.length}</Badge>
                <span>contratos a renovar nos próximos 30 dias</span>
              </div>
            )}
            {warrantyAlerts.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs">{warrantyAlerts.length}</Badge>
                <span>equipamentos com garantia a expirar (90 dias)</span>
                <Button size="sm" variant="link" className="text-xs p-0 h-auto" onClick={() => navigate("/equipamentos")}>Ver →</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent tasks */}
        <Card className="lg:col-span-2 border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display">Tarefas Recentes</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => navigate("/tarefas")}>
              Ver todas <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : (
              tasks
                ?.filter((t) => t.status !== "concluido" && t.status !== "faturado")
                .slice(0, 7)
                .map((task) => {
                  const isOverdue = task.expected_date && task.expected_date < today;
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer ${isOverdue ? "border-l-2 border-l-destructive" : ""}`}
                      onClick={() => navigate("/tarefas")}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{task.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(task as any).clients?.company || "—"}
                          {task.expected_date && <> · Prazo: {new Date(task.expected_date).toLocaleDateString("pt-PT")}</>}
                          {isOverdue && <span className="text-destructive font-medium"> · ATRASADA</span>}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Badge variant="outline" className={`text-xs ${priorityColor(task.priority)}`}>
                          {priorityLabels[task.priority]}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {statusLabels[task.status]}
                        </Badge>
                      </div>
                    </div>
                  );
                })
            )}
            {!isLoading && tasks?.filter((t) => t.status !== "concluido" && t.status !== "faturado").length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma tarefa ativa. 🎉</p>
            )}
          </CardContent>
        </Card>

        {/* Contract hours */}
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Users className="h-4 w-4" /> Horas Contratadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : activeContracts.length > 0 ? (
              activeContracts.map((client) => {
                const pct = client.contracted_hours ? (client.used_hours / client.contracted_hours) * 100 : 0;
                const remaining = (client.contracted_hours || 0) - client.used_hours;
                const isLow = pct > 85;
                return (
                  <div key={client.id} className="space-y-2 cursor-pointer hover:bg-muted/50 p-2 rounded-lg -mx-2 transition-colors" onClick={() => navigate(`/clientes/${client.id}`)}>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium truncate">{client.company}</p>
                      <span className={`text-xs font-medium ${isLow ? "text-destructive" : "text-muted-foreground"}`}>
                        {remaining}h restantes
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isLow ? "bg-destructive" : pct > 60 ? "bg-warning" : "bg-accent"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {client.used_hours}h / {client.contracted_hours}h utilizadas
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum contrato ativo.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profitability */}
      {profitability.length > 0 && (
        <Card className="border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Rentabilidade por Cliente
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => navigate("/relatorios")}>
              Ver relatórios <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {profitability.slice(0, 6).map((c, i) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => navigate(`/clientes/${c.id}`)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.company}</p>
                    <p className="text-xs text-muted-foreground">{c.totalHours}h trabalhadas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-display font-bold">{c.totalBilled.toFixed(0)}€</p>
                    {i === 0 && <TrendingUp className="h-3.5 w-3.5 text-success ml-auto" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <TaskFormDialog open={showNewTask} onOpenChange={setShowNewTask} />
      <ClientFormDialog open={showNewClient} onOpenChange={setShowNewClient} />
      <WorkLogDialog open={showWorkLog} onOpenChange={setShowWorkLog} />
    </div>
  );
}
