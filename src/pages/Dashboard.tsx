import {
  ClipboardList,
  Clock,
  AlertTriangle,
  CalendarCheck,
  Users,
  Plus,
  Timer,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clients, tasks, statusLabels, priorityLabels } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const pendingTasks = tasks.filter((t) => t.status === "pendente");
  const inProgressTasks = tasks.filter((t) => t.status === "em_progresso");
  const overdueTasks = tasks.filter(
    (t) =>
      t.expectedDate &&
      new Date(t.expectedDate) < new Date() &&
      t.status !== "concluido" &&
      t.status !== "faturado"
  );
  const todayTasks = tasks.filter(
    (t) => t.expectedDate === new Date().toISOString().split("T")[0]
  );
  const activeContracts = clients.filter((c) => c.contractedHours !== null);

  const stats = [
    {
      label: "Tarefas Pendentes",
      value: pendingTasks.length,
      icon: ClipboardList,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Em Progresso",
      value: inProgressTasks.length,
      icon: Clock,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Atrasadas",
      value: overdueTasks.length,
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Para Hoje",
      value: todayTasks.length,
      icon: CalendarCheck,
      color: "text-success",
      bg: "bg-success/10",
    },
  ];

  const priorityColor = (p: string) => {
    if (p === "alta") return "bg-destructive/15 text-destructive border-destructive/30";
    if (p === "media") return "bg-warning/15 text-warning-foreground border-warning/30";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visão geral do dia — {new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-1" /> Nova Tarefa
          </Button>
          <Button size="sm" variant="outline">
            <Timer className="h-4 w-4 mr-1" /> Registar Trabalho
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/clientes")}>
            <UserPlus className="h-4 w-4 mr-1" /> Novo Cliente
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`${s.bg} ${s.color} p-2.5 rounded-lg`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <Card className="lg:col-span-2 border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display">Tarefas Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks
              .filter((t) => t.status !== "concluido" && t.status !== "faturado")
              .slice(0, 5)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{task.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.clientName}
                      {task.expectedDate && (
                        <> · Prazo: {new Date(task.expectedDate).toLocaleDateString("pt-PT")}</>
                      )}
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
              ))}
          </CardContent>
        </Card>

        {/* Contract Hours */}
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Users className="h-4 w-4" /> Horas Contratadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeContracts.map((client) => {
              const pct = client.contractedHours
                ? (client.usedHours / client.contractedHours) * 100
                : 0;
              const remaining = (client.contractedHours || 0) - client.usedHours;
              const isLow = pct > 85;

              return (
                <div key={client.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium truncate">{client.company}</p>
                    <span className={`text-xs font-medium ${isLow ? "text-destructive" : "text-muted-foreground"}`}>
                      {remaining}h restantes
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isLow ? "bg-destructive" : pct > 60 ? "bg-warning" : "bg-accent"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {client.usedHours}h / {client.contractedHours}h utilizadas
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
