import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Plus, StickyNote, Monitor, FileText, Clock, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClient, statusLabels, priorityLabels } from "@/hooks/useData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: client, isLoading } = useClient(id);

  const { data: tasks } = useQuery({
    queryKey: ["tasks", "client", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("client_id", id!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: equipment } = useQuery({
    queryKey: ["equipment", "client", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("equipment").select("*").eq("client_id", id!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: contracts } = useQuery({
    queryKey: ["contracts", "client", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("contracts").select("*").eq("client_id", id!).order("end_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: notes } = useQuery({
    queryKey: ["technical_notes", "client", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("technical_notes").select("*").eq("client_id", id!).order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: workLogs } = useQuery({
    queryKey: ["work_logs", "client", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("work_logs").select("*, tasks(description)").eq("client_id", id!).order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Note dialog
  const [noteDialog, setNoteDialog] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("geral");

  const createNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("technical_notes").insert({
        client_id: id!,
        title: noteTitle,
        content: noteContent,
        category: noteCategory,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["technical_notes", "client", id] });
      setNoteDialog(false);
      setNoteTitle("");
      setNoteContent("");
      toast({ title: "Nota criada!" });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.from("technical_notes").delete().eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["technical_notes", "client", id] }),
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!client) return <div className="text-center py-12 text-muted-foreground">Cliente não encontrado.</div>;

  const priorityColor = (p: string) => {
    if (p === "alta") return "bg-destructive/15 text-destructive";
    if (p === "media") return "bg-warning/15 text-warning-foreground";
    return "bg-muted text-muted-foreground";
  };

  const categoryLabels: Record<string, string> = {
    geral: "Geral",
    rede: "Rede",
    servidor: "Servidor",
    software: "Software",
    hardware: "Hardware",
    seguranca: "Segurança",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/clientes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold">{client.company}</h1>
          <p className="text-sm text-muted-foreground">{client.name}</p>
        </div>
      </div>

      {/* Client info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border">
          <CardContent className="p-4 space-y-2 text-sm">
            {client.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{client.phone}</div>}
            {client.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{client.email}</div>}
            {client.city && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{client.address ? `${client.address}, ` : ""}{client.city}</div>}
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Horas Contratadas</p>
            <p className="text-2xl font-display font-bold">{client.used_hours}h <span className="text-sm font-normal text-muted-foreground">/ {client.contracted_hours || 0}h</span></p>
            {client.contracted_hours && (
              <div className="h-2 rounded-full bg-muted overflow-hidden mt-2">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min((client.used_hours / client.contracted_hours) * 100, 100)}%` }} />
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Resumo</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">{tasks?.length || 0}</span> <span className="text-muted-foreground">tarefas</span></div>
              <div><span className="font-medium">{equipment?.length || 0}</span> <span className="text-muted-foreground">equipamentos</span></div>
              <div><span className="font-medium">{contracts?.length || 0}</span> <span className="text-muted-foreground">contratos</span></div>
              <div><span className="font-medium">{workLogs?.length || 0}</span> <span className="text-muted-foreground">registos</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="notes"><StickyNote className="h-3.5 w-3.5 mr-1" />Notas ({notes?.length || 0})</TabsTrigger>
          <TabsTrigger value="tasks"><FileText className="h-3.5 w-3.5 mr-1" />Tarefas ({tasks?.length || 0})</TabsTrigger>
          <TabsTrigger value="equipment"><Monitor className="h-3.5 w-3.5 mr-1" />Equipamentos ({equipment?.length || 0})</TabsTrigger>
          <TabsTrigger value="worklogs"><Clock className="h-3.5 w-3.5 mr-1" />Registos ({workLogs?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-4 mt-4">
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setNoteDialog(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova Nota
          </Button>
          {notes?.length === 0 && <p className="text-sm text-muted-foreground py-4">Sem notas técnicas.</p>}
          <div className="grid md:grid-cols-2 gap-4">
            {notes?.map((note) => (
              <Card key={note.id} className="border">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium">{note.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">{categoryLabels[note.category] || note.category}</Badge>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Eliminar nota?")) deleteNote.mutate(note.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(note.updated_at).toLocaleDateString("pt-PT")}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4 space-y-2">
          {tasks?.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{task.description}</p>
                <p className="text-xs text-muted-foreground">
                  {task.expected_date && `Prazo: ${new Date(task.expected_date).toLocaleDateString("pt-PT")}`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Badge className={`text-xs ${priorityColor(task.priority)}`}>{priorityLabels[task.priority]}</Badge>
                <Badge variant="secondary" className="text-xs">{statusLabels[task.status]}</Badge>
              </div>
            </div>
          ))}
          {tasks?.length === 0 && <p className="text-sm text-muted-foreground py-4">Sem tarefas.</p>}
        </TabsContent>

        <TabsContent value="equipment" className="mt-4 space-y-2">
          {equipment?.map((eq) => (
            <div key={eq.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">{eq.brand} {eq.model}</p>
                <p className="text-xs text-muted-foreground">{eq.type} {eq.serial_number && `· S/N: ${eq.serial_number}`}</p>
              </div>
              {eq.warranty_end && (
                <Badge variant={eq.warranty_end < new Date().toISOString().split("T")[0] ? "destructive" : "secondary"} className="text-xs">
                  Garantia: {new Date(eq.warranty_end).toLocaleDateString("pt-PT")}
                </Badge>
              )}
            </div>
          ))}
          {equipment?.length === 0 && <p className="text-sm text-muted-foreground py-4">Sem equipamentos.</p>}
        </TabsContent>

        <TabsContent value="worklogs" className="mt-4 space-y-2">
          {workLogs?.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{log.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.date).toLocaleDateString("pt-PT")} · {log.hours}h{log.minutes > 0 && `${log.minutes}m`}
                  {(log as any).tasks?.description && ` · ${(log as any).tasks.description}`}
                </p>
              </div>
              {log.deduct_from_contract && <Badge variant="outline" className="text-xs shrink-0">Deduzido</Badge>}
            </div>
          ))}
          {workLogs?.length === 0 && <p className="text-sm text-muted-foreground py-4">Sem registos de trabalho.</p>}
        </TabsContent>
      </Tabs>

      {/* Note dialog */}
      <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Nota Técnica</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Título da nota..." />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={noteCategory} onValueChange={setNoteCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Detalhes técnicos..." rows={6} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialog(false)}>Cancelar</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => createNote.mutate()} disabled={!noteTitle}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
