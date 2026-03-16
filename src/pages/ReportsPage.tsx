import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/hooks/useData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const CHART_COLORS = ["hsl(24, 81%, 54%)", "hsl(216, 45%, 20%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(220, 15%, 60%)"];

export default function ReportsPage() {
  const { data: clients, isLoading: loadingClients } = useClients();

  const { data: workLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ["work_logs_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("work_logs").select("*, clients(company)").order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: contracts } = useQuery({
    queryKey: ["contracts_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contracts").select("*, clients(company)").order("end_date");
      if (error) throw error;
      return data;
    },
  });

  const { data: invoices } = useQuery({
    queryKey: ["invoices_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*, clients(company)");
      if (error) throw error;
      return data;
    },
  });

  const isLoading = loadingClients || loadingLogs;

  // Hours by client
  const hoursByClient = (clients || []).map((c) => {
    const logs = (workLogs || []).filter((l) => l.client_id === c.id);
    const totalHours = logs.reduce((sum, l) => sum + l.hours + l.minutes / 60, 0);
    return { name: c.company.substring(0, 15), hours: Math.round(totalHours * 10) / 10 };
  }).filter((c) => c.hours > 0).sort((a, b) => b.hours - a.hours).slice(0, 10);

  // Revenue by client
  const revenueByClient = (clients || []).map((c) => {
    const logs = (workLogs || []).filter((l) => l.client_id === c.id);
    const revenue = logs.reduce((sum, l) => sum + (l.hours + l.minutes / 60) * (l.hourly_rate || 0), 0);
    return { name: c.company.substring(0, 15), revenue: Math.round(revenue * 100) / 100 };
  }).filter((c) => c.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  // Monthly hours trend
  const monthlyData: Record<string, number> = {};
  (workLogs || []).forEach((l) => {
    const month = l.date.substring(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + l.hours + l.minutes / 60;
  });
  const monthlyTrend = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, hours]) => ({
      month: new Date(month + "-01").toLocaleDateString("pt-PT", { month: "short", year: "2-digit" }),
      hours: Math.round(hours * 10) / 10,
    }));

  // Invoice status breakdown
  const invoiceStats = {
    rascunho: invoices?.filter((i) => i.status === "rascunho").length || 0,
    emitida: invoices?.filter((i) => i.status === "emitida").length || 0,
    paga: invoices?.filter((i) => i.status === "paga").length || 0,
    cancelada: invoices?.filter((i) => i.status === "cancelada").length || 0,
  };
  const invoicePieData = [
    { name: "Rascunho", value: invoiceStats.rascunho },
    { name: "Emitida", value: invoiceStats.emitida },
    { name: "Paga", value: invoiceStats.paga },
    { name: "Cancelada", value: invoiceStats.cancelada },
  ].filter((d) => d.value > 0);

  // Contracts expiring soon
  const today = new Date().toISOString().split("T")[0];
  const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const expiringContracts = (contracts || []).filter((c) => c.active && c.end_date >= today && c.end_date <= soon);

  // Total revenue
  const totalRevenue = (workLogs || []).reduce((sum, l) => sum + (l.hours + l.minutes / 60) * (l.hourly_rate || 0), 0);
  const totalHours = (workLogs || []).reduce((sum, l) => sum + l.hours + l.minutes / 60, 0);
  const paidInvoices = invoices?.filter((i) => i.status === "paga").reduce((sum, i) => sum + i.total_amount, 0) || 0;

  if (isLoading) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Relatórios</h1>
        <p className="text-muted-foreground text-sm mt-1">Análise de desempenho e métricas</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Horas</p>
            <p className="text-2xl font-display font-bold">{Math.round(totalHours)}h</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Receita Potencial</p>
            <p className="text-2xl font-display font-bold">{Math.round(totalRevenue)}€</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Faturado (Pago)</p>
            <p className="text-2xl font-display font-bold text-success">{Math.round(paidInvoices)}€</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Clientes Ativos</p>
            <p className="text-2xl font-display font-bold">{clients?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {expiringContracts.length > 0 && (
        <Card className="border border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-warning-foreground">⚠️ Contratos a Expirar (próx. 30 dias)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {expiringContracts.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span>{c.name} — {(c as any).clients?.company}</span>
                <Badge variant="outline" className="text-xs">{new Date(c.end_date).toLocaleDateString("pt-PT")}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hours by client */}
        <Card className="border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-display">Horas por Cliente</CardTitle></CardHeader>
          <CardContent>
            {hoursByClient.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={hoursByClient} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="hours" fill="hsl(24, 81%, 54%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground py-8 text-center">Sem dados de horas.</p>}
          </CardContent>
        </Card>

        {/* Revenue by client */}
        <Card className="border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-display">Receita por Cliente (€)</CardTitle></CardHeader>
          <CardContent>
            {revenueByClient.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueByClient} margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="revenue" fill="hsl(216, 45%, 20%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground py-8 text-center">Sem dados de receita.</p>}
          </CardContent>
        </Card>

        {/* Monthly trend */}
        <Card className="border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-display">Tendência Mensal (Horas)</CardTitle></CardHeader>
          <CardContent>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyTrend} margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="hours" stroke="hsl(24, 81%, 54%)" strokeWidth={2} dot={{ fill: "hsl(24, 81%, 54%)" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground py-8 text-center">Sem dados mensais.</p>}
          </CardContent>
        </Card>

        {/* Invoice status */}
        <Card className="border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-display">Estado das Faturas</CardTitle></CardHeader>
          <CardContent>
            {invoicePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={invoicePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                    {invoicePieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground py-8 text-center">Sem faturas.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
