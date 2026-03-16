import { useState } from "react";
import { Search, Plus, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clients } from "@/data/mockData";

export default function Clients() {
  const [search, setSearch] = useState("");

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {clients.length} clientes registados
          </p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="h-4 w-4 mr-1" /> Novo Cliente
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((client) => {
          const hasContract = client.contractedHours !== null;
          const remaining = hasContract
            ? (client.contractedHours || 0) - client.usedHours
            : null;
          const isLow = remaining !== null && remaining <= 5;

          return (
            <Card
              key={client.id}
              className="border hover:shadow-md transition-shadow cursor-pointer group"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-base group-hover:text-accent transition-colors">
                      {client.company}
                    </h3>
                    <p className="text-sm text-muted-foreground">{client.name}</p>
                  </div>
                  {hasContract ? (
                    <Badge
                      variant="outline"
                      className={
                        isLow
                          ? "border-destructive/50 text-destructive bg-destructive/10"
                          : "border-accent/50 text-accent bg-accent/10"
                      }
                    >
                      {remaining}h restantes
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Sem contrato</Badge>
                  )}
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{client.city}</span>
                  </div>
                  {hasContract && client.contractEnd && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Contrato até{" "}
                        {new Date(client.contractEnd).toLocaleDateString("pt-PT")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum cliente encontrado.</p>
        </div>
      )}
    </div>
  );
}
