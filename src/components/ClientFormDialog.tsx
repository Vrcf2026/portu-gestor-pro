import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateClient, useUpdateClient, type Client } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

export function ClientFormDialog({ open, onOpenChange, client }: ClientFormDialogProps) {
  const { toast } = useToast();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const isEditing = !!client;

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: "", company: "", phone: "", email: "",
      address: "", city: "", notes: "",
      contracted_hours: "", contract_start: "", contract_end: "",
    },
  });

  useEffect(() => {
    if (client) {
      reset({
        name: client.name || "",
        company: client.company || "",
        phone: client.phone || "",
        email: client.email || "",
        address: client.address || "",
        city: client.city || "",
        notes: client.notes || "",
        contracted_hours: client.contracted_hours?.toString() || "",
        contract_start: client.contract_start || "",
        contract_end: client.contract_end || "",
      });
    } else {
      reset({
        name: "", company: "", phone: "", email: "",
        address: "", city: "", notes: "",
        contracted_hours: "", contract_start: "", contract_end: "",
      });
    }
  }, [client, reset]);

  const onSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        contracted_hours: values.contracted_hours ? Number(values.contracted_hours) : null,
        contract_start: values.contract_start || null,
        contract_end: values.contract_end || null,
      };

      if (isEditing && client) {
        await updateClient.mutateAsync({ id: client.id, ...payload });
        toast({ title: "Cliente atualizado!" });
      } else {
        await createClient.mutateAsync(payload);
        toast({ title: "Cliente criado!" });
      }
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input {...register("name", { required: true })} placeholder="Nome do contacto" />
            </div>
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Input {...register("company", { required: true })} placeholder="Nome da empresa" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input {...register("phone")} placeholder="+351 ..." />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...register("email")} type="email" placeholder="email@empresa.pt" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Morada</Label>
              <Input {...register("address")} placeholder="Rua, número" />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input {...register("city")} placeholder="Cidade" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea {...register("notes")} placeholder="Notas sobre o cliente..." rows={2} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Horas Contratadas</Label>
              <Input {...register("contracted_hours")} type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Início Contrato</Label>
              <Input {...register("contract_start")} type="date" />
            </div>
            <div className="space-y-2">
              <Label>Fim Contrato</Label>
              <Input {...register("contract_end")} type="date" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isSubmitting ? "A guardar..." : isEditing ? "Guardar" : "Criar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
