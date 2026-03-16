import { useState } from "react";
import { Plus, Search, FileText, Download, Eye, Trash2 } from "lucide-react";
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
import { useClients, useDeleteInvoice } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
  const [detailInvoice, setDetailInvoice] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: clients } = useClients();
  const deleteInvoice = useDeleteInvoice();

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

  // Invoice items for detail view
  const { data: invoiceItems } = useQuery({
    queryKey: ["invoice_items", detailInvoice?.id],
    enabled: !!detailInvoice?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", detailInvoice.id)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);

  const createInvoice = useMutation({
    mutationFn: async () => {
      const logs = uninvoicedLogs?.filter((l) => selectedLogs.includes(l.id)) || [];
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

  const handleDelete = async (id: string, number: string) => {
    if (!confirm(`Eliminar fatura "${number}"?`)) return;
    try {
      await deleteInvoice.mutateAsync(id);
      toast({ title: "Fatura eliminada." });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const exportPDF = (inv: any, items?: any[]) => {
    const doc = new jsPDF();
    const company = (inv as any).clients?.company || "Cliente";

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("VRCF Gestão IT", 20, 25);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Serviços de Informática", 20, 32);

    // Invoice info
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`FATURA ${inv.invoice_number}`, 20, 50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Cliente: ${company}`, 20, 60);
    doc.text(`Data de Emissão: ${new Date(inv.issue_date).toLocaleDateString("pt-PT")}`, 20, 67);
    if (inv.due_date) doc.text(`Data de Vencimento: ${new Date(inv.due_date).toLocaleDateString("pt-PT")}`, 20, 74);
    doc.text(`Estado: ${statusLabels[inv.status as InvoiceStatus]}`, 20, inv.due_date ? 81 : 74);

    const startY = inv.due_date ? 90 : 83;

    // Items table
    if (items && items.length > 0) {
      autoTable(doc, {
        startY,
        head: [["Descrição", "Horas", "Taxa (€/h)", "Total (€)"]],
        body: items.map((item) => [
          item.description,
          `${item.hours.toFixed(1)}h`,
          `${item.hourly_rate.toFixed(2)}€`,
          `${item.total.toFixed(2)}€`,
        ]),
        foot: [["", "", "Total:", `${inv.total_amount.toFixed(2)}€`]],
        theme: "striped",
        headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
        styles: { fontSize: 9 },
      });
    } else {
      doc.text(`Total: ${inv.total_amount.toFixed(2)}€`, 20, startY + 10);
    }

    // Notes
    if (inv.notes) {
      const finalY = (doc as any).lastAutoTable?.finalY || startY + 20;
      doc.setFontSize(9);
      doc.text(`Notas: ${inv.notes}`, 20, finalY + 15);
    }

    doc.save(`fatura-${inv.invoice_number.replace(/\s+/g, "-")}.pdf`);
    toast({ title: "PDF exportado!" });
  };

  const exportCSV = () => {
    if (!invoices || invoices.length === 0) return;
    const headers = ["Nº Fatura", "Cliente", "Data Emissão", "Vencimento", "Total", "Estado"];
    const rows = invoices.map((inv) => [
      inv.invoice_number,
      (inv as any).clients?.company || "",
      new Date(inv.issue_date).toLocaleDateString("pt-PT"),
      inv.due_date ? new Date(inv.due_date).toLocaleDateString("pt-PT") : "",
      inv.total_amount.toFixed(2),
      statusLabels[inv.status as InvoiceStatus],
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faturas-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exportado!" });
  };

  const viewInvoiceDetail = async (inv: any) => {
    setDetailInvoice(inv);
    setDetailDialogOpen(true);
  };

  // Summary stats
  const totalPaid = invoices?.filter((i) => i.status === "paga").reduce((s, i) => s + i.total_amount, 0) || 0;
  const totalPending = invoices?.filter((i) => i.status === "emitida").reduce((s, i) => s + i.total_amount, 0) || 0;
  const totalDraft = invoices?.filter((i) => i.status === "rascunho").reduce((s, i) => s + i.total_amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Faturação</h1>
          <p className="text-muted-foreground text-sm mt-1">{invoices?.length || 0} faturas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!invoices?.length}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Nova Fatura
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pago</p>
            <p className="text-xl font-display font-bold text-success">{totalPaid.toFixed(0)}€</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pendente</p>
            <p className="text-xl font-display font-bold text-primary">{totalPending.toFixed(0)}€</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Rascunho</p>
            <p className="text-xl font-display font-bold text-muted-foreground">{totalDraft.toFixed(0)}€</p>
          </CardContent>
        </Card>
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
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{inv.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{(inv as any).clients?.company || "—"} · {new Date(inv.issue_date).toLocaleDateString("pt-PT")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-bold text-lg">{inv.total_amount.toFixed(2)}€</p>
                  <Select value={inv.status} onValueChange={(v) => updateStatus.mutate({ id: inv.id, status: v as InvoiceStatus })}>
                    <SelectTrigger className="w-28 h-8">
                      <Badge className={`${statusColors[inv.status]} text-xs`}>{statusLabels[inv.status]}</Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(statusLabels) as InvoiceStatus[]).map((s) => (
                        <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => viewInvoiceDetail(inv)} title="Ver detalhes">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => exportPDF(inv, [])} title="Exportar PDF">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(inv.id, inv.invoice_number)} title="Eliminar">
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                <div className="flex items-center justify-between">
                  <Label>Registos de Trabalho ({selectedLogs.length} selecionados)</Label>
                  <Button type="button" size="sm" variant="ghost" className="text-xs" onClick={() => setSelectedLogs(uninvoicedLogs.map((l) => l.id))}>
                    Selecionar todos
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
                  {uninvoicedLogs.map((log) => {
                    const total = (log.hours + log.minutes / 60) * (log.hourly_rate || 0);
                    return (
                      <label key={log.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer text-sm">
                        <input type="checkbox" checked={selectedLogs.includes(log.id)} onChange={() => toggleLog(log.id)} className="rounded" />
                        <span className="flex-1 truncate">{log.description}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {log.hours}h{log.minutes > 0 ? `${log.minutes}m` : ""} · {total.toFixed(2)}€
                        </span>
                      </label>
                    );
                  })}
                </div>
                {selectedLogs.length > 0 && (
                  <p className="text-sm font-medium text-right">
                    Total: {uninvoicedLogs
                      .filter((l) => selectedLogs.includes(l.id))
                      .reduce((sum, l) => sum + (l.hours + l.minutes / 60) * (l.hourly_rate || 0), 0)
                      .toFixed(2)}€
                  </p>
                )}
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

      {/* Invoice detail dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fatura {detailInvoice?.invoice_number}</DialogTitle>
          </DialogHeader>
          {detailInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium">{(detailInvoice as any).clients?.company}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estado</p>
                  <Badge className={`${statusColors[detailInvoice.status as InvoiceStatus]}`}>
                    {statusLabels[detailInvoice.status as InvoiceStatus]}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Data de Emissão</p>
                  <p className="font-medium">{new Date(detailInvoice.issue_date).toLocaleDateString("pt-PT")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vencimento</p>
                  <p className="font-medium">{detailInvoice.due_date ? new Date(detailInvoice.due_date).toLocaleDateString("pt-PT") : "—"}</p>
                </div>
              </div>

              {invoiceItems && invoiceItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Itens</p>
                  <div className="border rounded-lg divide-y">
                    {invoiceItems.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between text-sm">
                        <div className="min-w-0 flex-1">
                          <p className="truncate">{item.description}</p>
                          <p className="text-xs text-muted-foreground">{item.hours.toFixed(1)}h × {item.hourly_rate.toFixed(2)}€</p>
                        </div>
                        <p className="font-medium shrink-0">{item.total.toFixed(2)}€</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <p className="font-medium">Total</p>
                <p className="text-xl font-display font-bold">{detailInvoice.total_amount.toFixed(2)}€</p>
              </div>

              {detailInvoice.notes && (
                <div>
                  <p className="text-sm font-medium">Notas</p>
                  <p className="text-sm text-muted-foreground">{detailInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>Fechar</Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => detailInvoice && exportPDF(detailInvoice, invoiceItems || [])}
            >
              <Download className="h-4 w-4 mr-1" /> Exportar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
