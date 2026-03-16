import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, List, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTasks, statusLabels, priorityLabels } from "@/hooks/useData";
import { TaskFormDialog } from "@/components/TaskFormDialog";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const WEEKDAYS_FULL = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

type ViewMode = "month" | "week" | "day";

export default function CalendarPage() {
  const { data: tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date().toISOString().split("T")[0];

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return (tasks || []).filter((t) => t.expected_date === dateStr);
  };

  const priorityDot = (p: string) => {
    if (p === "alta") return "bg-destructive";
    if (p === "media") return "bg-warning";
    return "bg-muted-foreground";
  };

  const isOverdue = (t: any) => t.expected_date && t.expected_date < today && t.status !== "concluido" && t.status !== "faturado";

  // Month view days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let i = startDay - 1; i >= 0; i--) days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    return days;
  }, [year, month]);

  // Week view days
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(d);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [currentDate]);

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  const headerLabel = () => {
    if (view === "month") return `${MONTHS[month]} ${year}`;
    if (view === "week") {
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.getDate()} ${MONTHS[start.getMonth()].substring(0, 3)} — ${end.getDate()} ${MONTHS[end.getMonth()].substring(0, 3)} ${end.getFullYear()}`;
    }
    return currentDate.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Calendário</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex border rounded-lg overflow-hidden">
            {(["month", "week", "day"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === v ? "bg-accent text-accent-foreground" : "bg-card hover:bg-muted text-muted-foreground"}`}
              >
                {v === "month" ? "Mês" : v === "week" ? "Semana" : "Dia"}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={goToday}>Hoje</Button>
          <h2 className="text-base font-display font-semibold min-w-[160px] text-center">{headerLabel()}</h2>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Month View */}
      {view === "month" && (
        <Card className="border">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b">
              {WEEKDAYS.map((d) => (
                <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground uppercase">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day, i) => {
                const dateStr = day.date.toISOString().split("T")[0];
                const isToday = dateStr === today;
                const dayTasks = getTasksForDate(day.date);
                return (
                  <div key={i} className={`min-h-[80px] md:min-h-[100px] border-b border-r p-1 ${!day.isCurrentMonth ? "bg-muted/30" : ""} ${isToday ? "bg-accent/5" : ""}`}>
                    <div className={`text-xs font-medium mb-1 px-1 ${isToday ? "bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center" : !day.isCurrentMonth ? "text-muted-foreground/50" : "text-foreground"}`}>
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 3).map((task) => (
                        <button key={task.id} onClick={() => { setSelectedTask(task); setDialogOpen(true); }} className="w-full text-left">
                          <div className={`flex items-center gap-1 px-1 py-0.5 rounded text-xs truncate hover:bg-muted transition-colors ${isOverdue(task) ? "text-destructive font-medium" : ""}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot(task.priority)}`} />
                            <span className="truncate">{task.description}</span>
                          </div>
                        </button>
                      ))}
                      {dayTasks.length > 3 && <p className="text-xs text-muted-foreground px-1">+{dayTasks.length - 3} mais</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {view === "week" && (
        <Card className="border">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 divide-x">
              {weekDays.map((day, i) => {
                const dateStr = day.toISOString().split("T")[0];
                const isToday = dateStr === today;
                const dayTasks = getTasksForDate(day);
                return (
                  <div key={i} className={`min-h-[300px] p-2 ${isToday ? "bg-accent/5" : ""}`}>
                    <div className="text-center mb-3">
                      <p className="text-xs text-muted-foreground uppercase">{WEEKDAYS[i]}</p>
                      <p className={`text-lg font-display font-bold ${isToday ? "text-accent" : ""}`}>{day.getDate()}</p>
                    </div>
                    <div className="space-y-1.5">
                      {dayTasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => { setSelectedTask(task); setDialogOpen(true); }}
                          className={`w-full text-left p-2 rounded-lg text-xs border transition-colors hover:shadow-sm ${isOverdue(task) ? "border-destructive/50 bg-destructive/5" : "border-border bg-card"}`}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot(task.priority)}`} />
                            <span className="font-medium truncate">{task.description}</span>
                          </div>
                          <p className="text-muted-foreground truncate">{(task as any).clients?.company || ""}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day View */}
      {view === "day" && (
        <Card className="border">
          <CardContent className="p-6">
            <div className="space-y-3">
              {getTasksForDate(currentDate).length === 0 ? (
                <p className="text-center text-muted-foreground py-12">Sem tarefas para este dia.</p>
              ) : (
                getTasksForDate(currentDate).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => { setSelectedTask(task); setDialogOpen(true); }}
                    className={`flex items-start justify-between gap-3 p-4 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${isOverdue(task) ? "border-l-4 border-l-destructive" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{task.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(task as any).clients?.company || "—"}
                        {task.notes && <> · {task.notes}</>}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs">{priorityLabels[task.priority]}</Badge>
                      <Badge variant="secondary" className="text-xs">{statusLabels[task.status]}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <TaskFormDialog open={dialogOpen} onOpenChange={setDialogOpen} task={selectedTask} />
    </div>
  );
}
