import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ---- CHECKLIST TEMPLATES ----
export function useChecklistTemplates() {
  return useQuery({
    queryKey: ["checklist_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklist_templates")
        .select("*, checklist_template_items(*)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateChecklistTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; category: string; equipment_type?: string; items: string[] }) => {
      const { data: template, error } = await supabase
        .from("checklist_templates")
        .insert({ name: input.name, category: input.category, equipment_type: input.equipment_type || null })
        .select()
        .single();
      if (error) throw error;

      if (input.items.length > 0) {
        const itemRows = input.items.map((label, i) => ({
          template_id: template.id,
          label,
          sort_order: i,
        }));
        const { error: itemError } = await supabase.from("checklist_template_items").insert(itemRows);
        if (itemError) throw itemError;
      }
      return template;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist_templates"] }),
  });
}

export function useDeleteChecklistTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("checklist_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklist_templates"] }),
  });
}

// ---- TASK CHECKLISTS ----
export function useTaskChecklists(taskId: string | undefined) {
  return useQuery({
    queryKey: ["task_checklists", taskId],
    enabled: !!taskId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_checklists")
        .select("*, task_checklist_items(*)")
        .eq("task_id", taskId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useApplyTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, templateId }: { taskId: string; templateId: string }) => {
      // Get template + items
      const { data: template, error: tErr } = await supabase
        .from("checklist_templates")
        .select("*, checklist_template_items(*)")
        .eq("id", templateId)
        .single();
      if (tErr) throw tErr;

      // Create task checklist
      const { data: checklist, error: cErr } = await supabase
        .from("task_checklists")
        .insert({ task_id: taskId, template_id: templateId, name: template.name })
        .select()
        .single();
      if (cErr) throw cErr;

      // Create items
      const items = (template.checklist_template_items || [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((item: any, i: number) => ({
          checklist_id: checklist.id,
          label: item.label,
          sort_order: i,
        }));

      if (items.length > 0) {
        const { error: iErr } = await supabase.from("task_checklist_items").insert(items);
        if (iErr) throw iErr;
      }
      return checklist;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["task_checklists", vars.taskId] }),
  });
}

export function useToggleChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, checked, notes }: { id: string; checked: boolean; notes?: string }) => {
      const updates: any = { checked, checked_at: checked ? new Date().toISOString() : null };
      if (notes !== undefined) updates.notes = notes;
      const { error } = await supabase.from("task_checklist_items").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task_checklists"] }),
  });
}

export function useDeleteTaskChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("task_checklists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task_checklists"] }),
  });
}
