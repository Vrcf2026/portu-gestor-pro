import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTasks, statusLabels, priorityLabels } from "@/hooks/useData";
import { TaskFormDialog } from "@/components/TaskFormDialog";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function CalendarPage() {
  const { data: tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return (tasks || []).filter((t) => t.expected_date === dateStr);
  };

  const today = new Date().toISOString().split("T")[0];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const priorityDot = (p: string) => {
    if (p === "alta") return "bg-destructive";
    if (p === "media") return "bg-warning";
    return "bg-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Calendário</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>Hoje</Button>
          <h2 className="text-lg font-display font-semibold min-w-[180px] text-center">
            {MONTHS[month]} {year}
          </h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="border">
        <CardContent className="p-0">
          {/* Header */}
          <div className="grid grid-cols-7 border-b">
            {WEEKDAYS.map((d) => (
              <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const dateStr = day.date.toISOString().split("T")[0];
              const isToday = dateStr === today;
              const dayTasks = getTasksForDate(day.date);

              return (
                <div
                  key={i}
                  className={`min-h-[80px] md:min-h-[100px] border-b border-r p-1 ${
                    !day.isCurrentMonth ? "bg-muted/30" : ""
                  } ${isToday ? "bg-accent/5" : ""}`}
                >
                  <div className={`text-xs font-medium mb-1 px-1 ${
                    isToday
                      ? "bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center"
                      : !day.isCurrentMonth
                      ? "text-muted-foreground/50"
                      : "text-foreground"
                  }`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 3).map((task) => (
                      <button
                        key={task.id}
                        onClick={() => { setSelectedTask(task); setDialogOpen(true); }}
                        className="w-full text-left"
                      >
                        <div className="flex items-center gap-1 px-1 py-0.5 rounded text-xs truncate hover:bg-muted transition-colors">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot(task.priority)}`} />
                          <span className="truncate">{task.description}</span>
                        </div>
                      </button>
                    ))}
                    {dayTasks.length > 3 && (
                      <p className="text-xs text-muted-foreground px-1">+{dayTasks.length - 3} mais</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <TaskFormDialog open={dialogOpen} onOpenChange={setDialogOpen} task={selectedTask} />
    </div>
  );
}
