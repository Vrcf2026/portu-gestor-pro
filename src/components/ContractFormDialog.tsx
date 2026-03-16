import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContractFormDialog({ open, onOpenChange }: ContractFormDialogProps) {
  const { toast } = useToast();
  const { data: clients } = useClients();
  const qc = useQueryClient();

  const createContract = useMutation({
    mutationFn: async (contract: any) => {
      const { data, error } = await supabase.from("contracts").insert(contract).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      client_id: "",
      name: "",
      hours: 0,
      hourly_rate: 0,
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      notes: "",
    },
  });

  const onSubmit = async (values: any) => {
    try {
      await createContract.mutateAsync({
        client_id: values.client_id,
        name: values.name,
        hours: Number(values.hours),
        hourly_rate: Number(values.hourly_rate),
        start_date: values.start_date,
        end_date: values.end_date,
        notes: values.notes || "",
      });
      toast({ title: "Contrato criado com sucesso!" });
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Novo Contrato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={watch("client_id")} onValueChange={(v) => setValue("client_id", v)}>
              <SelectTrigger><SelectValue placeholder="Selecionar cliente" /></SelectTrigger>
              <SelectContent>
                {clients?.map((c) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nome do Contrato</Label>
            <Input {...register("name", { required: true })} placeholder="Ex: Suporte Anual 2026" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Horas Incluídas</Label>
              <Input {...register("hours")} type="number" min="0" />
            </div>
            <div className="space-y-2">
              <Label>Taxa Horária (€)</Label>
              <Input {...register("hourly_rate")} type="number" min="0" step="0.01" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input {...register("start_date", { required: true })} type="date" />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input {...register("end_date", { required: true })} type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea {...register("notes")} placeholder="Observações..." rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isSubmitting ? "A guardar..." : "Criar Contrato"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
