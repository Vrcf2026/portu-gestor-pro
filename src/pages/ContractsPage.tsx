import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClients } from "@/hooks/useData";
import { ContractFormDialog } from "@/components/ContractFormDialog";

export default function ContractsPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("*, clients(company)")
        .order("end_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const filtered = (contracts || []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      ((c as any).clients?.company || "").toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Contratos</h1>
          <p className="text-muted-foreground text-sm mt-1">{contracts?.length || 0} contratos</p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Novo Contrato
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Pesquisar contratos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((contract) => {
            const pct = contract.hours > 0 ? (contract.used_hours / contract.hours) * 100 : 0;
            const remaining = contract.hours - contract.used_hours;
            const isExpiring = contract.end_date && contract.end_date <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
            const isExpired = contract.end_date < today;

            return (
              <Card key={contract.id} className={`border hover:shadow-md transition-shadow ${isExpired ? "border-l-4 border-l-destructive" : isExpiring ? "border-l-4 border-l-warning" : ""}`}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-sm">{contract.name}</h3>
                      <p className="text-xs text-muted-foreground">{(contract as any).clients?.company || "—"}</p>
                    </div>
                    {isExpired ? (
                      <Badge variant="destructive" className="text-xs">Expirado</Badge>
                    ) : contract.active ? (
                      <Badge className="text-xs bg-success text-success-foreground">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Inativo</Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{contract.used_hours}h / {contract.hours}h</span>
                      <span className={`font-medium ${pct > 85 ? "text-destructive" : "text-muted-foreground"}`}>
                        {remaining}h restantes
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct > 85 ? "bg-destructive" : pct > 60 ? "bg-warning" : "bg-accent"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Período: {new Date(contract.start_date).toLocaleDateString("pt-PT")} — {new Date(contract.end_date).toLocaleDateString("pt-PT")}</p>
                    <p>Taxa: {contract.hourly_rate}€/hora</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground"><p>Nenhum contrato encontrado.</p></div>
      )}

      <ContractFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
