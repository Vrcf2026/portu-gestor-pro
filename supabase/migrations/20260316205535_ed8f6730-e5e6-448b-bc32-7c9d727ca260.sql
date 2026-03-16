
-- Checklist templates (reusable)
CREATE TABLE public.checklist_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'geral',
  equipment_type text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to checklist_templates" ON public.checklist_templates FOR ALL USING (true) WITH CHECK (true);

-- Template items
CREATE TABLE public.checklist_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  label text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checklist_template_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to checklist_template_items" ON public.checklist_template_items FOR ALL USING (true) WITH CHECK (true);

-- Task checklists (instance of a template applied to a task)
CREATE TABLE public.task_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.checklist_templates(id) ON DELETE SET NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.task_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to task_checklists" ON public.task_checklists FOR ALL USING (true) WITH CHECK (true);

-- Task checklist items (actual checkable items)
CREATE TABLE public.task_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid NOT NULL REFERENCES public.task_checklists(id) ON DELETE CASCADE,
  label text NOT NULL,
  checked boolean NOT NULL DEFAULT false,
  notes text NULL,
  sort_order int NOT NULL DEFAULT 0,
  checked_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.task_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to task_checklist_items" ON public.task_checklist_items FOR ALL USING (true) WITH CHECK (true);
