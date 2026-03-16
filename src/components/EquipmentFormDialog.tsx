import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useClients, useCreateEquipment, useUpdateEquipment } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type EquipmentType = Database["public"]["Enums"]["equipment_type"];
const equipmentTypes: EquipmentType[] = ["PC", "NAS", "Router", "Switch", "CCTV", "Servidor"];

interface EquipmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: any | null;
}

export function EquipmentFormDialog({ open, onOpenChange, equipment }: EquipmentFormDialogProps) {
  const { toast } = useToast();
  const { data: clients } = useClients();
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();
  const isEditing = !!equipment;

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      client_id: "", type: "" as string, brand: "", model: "",
      serial_number: "", install_date: "", warranty_end: "", notes: "",
    },
  });

  useEffect(() => {
    if (equipment) {
      reset({
        client_id: equipment.client_id || "",
        type: equipment.type || "",
        brand: equipment.brand || "",
        model: equipment.model || "",
        serial_number: equipment.serial_number || "",
        install_date: equipment.install_date || "",
        warranty_end: equipment.warranty_end || "",
        notes: equipment.notes || "",
      });
    } else {
      reset({
        client_id: "", type: "", brand: "", model: "",
        serial_number: "", install_date: "", warranty_end: "", notes: "",
      });
    }
  }, [equipment, reset]);

  const onSubmit = async (values: any) => {
    try {
      const payload = {
        client_id: values.client_id,
        type: values.type as EquipmentType,
        brand: values.brand,
        model: values.model,
        serial_number: values.serial_number || null,
        install_date: values.install_date || null,
        warranty_end: values.warranty_end || null,
        notes: values.notes || "",
      };

      if (isEditing && equipment) {
        await updateEquipment.mutateAsync({ id: equipment.id, ...payload });
        toast({ title: "Equipamento atualizado!" });
      } else {
        await createEquipment.mutateAsync(payload);
        toast({ title: "Equipamento registado!" });
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
            {isEditing ? "Editar Equipamento" : "Novo Equipamento"}
          </DialogTitle>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={watch("type")} onValueChange={(v) => setValue("type", v)}>
                <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  {equipmentTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Marca</Label>
              <Input {...register("brand", { required: true })} placeholder="Ex: Dell, HP" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Input {...register("model", { required: true })} placeholder="Modelo" />
            </div>
            <div className="space-y-2">
              <Label>Nº Série</Label>
              <Input {...register("serial_number")} placeholder="Nº série" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Instalação</Label>
              <Input {...register("install_date")} type="date" />
            </div>
            <div className="space-y-2">
              <Label>Fim da Garantia</Label>
              <Input {...register("warranty_end")} type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea {...register("notes")} placeholder="Notas de manutenção..." rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isSubmitting ? "A guardar..." : isEditing ? "Guardar" : "Criar Equipamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
