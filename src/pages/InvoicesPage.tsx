import { useState } from "react";
import { Plus, Search, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClients } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

const statusColors: Record<InvoiceStatus, string> = {
  rascunho: "bg-muted text-muted-foreground",
  emitida: "bg-primary/15 text-primary",
  paga: "bg-success/15 text-success",
  cancelada: "bg-destructive/15 text-destructive",
};

const statusLabels: Record<InvoiceStatus, string> = {
  rascunho: "Rascunho",
  emitida: "Emitida",
  paga: "Paga",
  cancelada: "Cancelada",
};

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: clients } = useClients();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, clients(company)")
        .order("issue_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Form state
  const [clientId, setClientId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Uninvoiced work logs for selected client
  const { data: uninvoicedLogs } = useQuery({
    queryKey: ["uninvoiced_logs", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_logs")
        .select("*")
        .eq("client_id", clientId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);

  const createInvoice = useMutation({
    mutationFn: async () => {
      const logs = uninvoicedLogs?.filter((l) => selectedLogs.includes(l.id)) || [];
      const totalHours = logs.reduce((sum, l) => sum + l.hours + l.minutes / 60, 0);
      const avgRate = logs.reduce((sum, l) => sum + (l.hourly_rate || 0), 0) / (logs.length || 1);
      const totalAmount = logs.reduce((sum, l) => {
        const h = l.hours + l.minutes / 60;
        return sum + h * (l.hourly_rate || 0);
      }, 0);

      const { data: invoice, error } = await supabase.from("invoices").insert({
        client_id: clientId,
        invoice_number: invoiceNumber,
        notes,
        due_date: dueDate || null,
        total_amount: Math.round(totalAmount * 100) / 100,
      }).select().single();
      if (error) throw error;

      // Create invoice items from selected logs
      if (logs.length > 0) {
        const items = logs.map((l) => ({
          invoice_id: invoice.id,
          work_log_id: l.id,
          description: l.description,
          hours: l.hours + l.minutes / 60,
          hourly_rate: l.hourly_rate || 0,
          total: (l.hours + l.minutes / 60) * (l.hourly_rate || 0),
        }));
        const { error: itemsError } = await supabase.from("invoice_items").insert(items);
        if (itemsError) throw itemsError;
      }

      return invoice;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Fatura criada!" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InvoiceStatus }) => {
      const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });

  const resetForm = () => {
    setClientId("");
    setInvoiceNumber("");
    setNotes("");
    setDueDate("");
    setSelectedLogs([]);
  };

  const filtered = (invoices || []).filter(
    (inv) =>
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      ((inv as any).clients?.company || "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleLog = (logId: string) => {
    setSelectedLogs((prev) =>
      prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Faturação</h1>
          <p className="text-muted-foreground text-sm mt-1">{invoices?.length || 0} faturas</p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Nova Fatura
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Pesquisar faturas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => (
            <Card key={inv.id} className="border hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{inv.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{(inv as any).clients?.company || "—"} · {new Date(inv.issue_date).toLocaleDateString("pt-PT")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-display font-bold text-lg">{inv.total_amount.toFixed(2)}€</p>
                  <Select value={inv.status} onValueChange={(v) => updateStatus.mutate({ id: inv.id, status: v as InvoiceStatus })}>
                    <SelectTrigger className="w-32">
                      <Badge className={`${statusColors[inv.status]} text-xs`}>{statusLabels[inv.status]}</Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(statusLabels) as InvoiceStatus[]).map((s) => (
                        <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground"><p>Nenhuma fatura encontrada.</p></div>
      )}

      {/* Create invoice dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova Fatura</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nº Fatura</Label>
                <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="FT 2026/001" />
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={clientId} onValueChange={(v) => { setClientId(v); setSelectedLogs([]); }}>
                <SelectTrigger><SelectValue placeholder="Selecionar cliente..." /></SelectTrigger>
                <SelectContent>
                  {clients?.map((c) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {clientId && uninvoicedLogs && uninvoicedLogs.length > 0 && (
              <div className="space-y-2">
                <Label>Registos de Trabalho ({selectedLogs.length} selecionados)</Label>
                <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
                  {uninvoicedLogs.map((log) => (
                    <label key={log.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer text-sm">
                      <input type="checkbox" checked={selectedLogs.includes(log.id)} onChange={() => toggleLog(log.id)} className="rounded" />
                      <span className="flex-1 truncate">{log.description}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{log.hours}h{log.minutes > 0 && `${log.minutes}m`} · {(log.hourly_rate || 0)}€/h</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => createInvoice.mutate()} disabled={!clientId || !invoiceNumber}>
              Criar Fatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
