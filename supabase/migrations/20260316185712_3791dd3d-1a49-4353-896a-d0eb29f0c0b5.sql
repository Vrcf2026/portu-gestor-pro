
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- CLIENTS TABLE
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  notes TEXT DEFAULT '',
  contracted_hours NUMERIC(8,2),
  used_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
  contract_start DATE,
  contract_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CONTRACTS TABLE
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hours NUMERIC(8,2) NOT NULL DEFAULT 0,
  used_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to contracts" ON public.contracts FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TASKS TABLE
CREATE TYPE public.task_priority AS ENUM ('baixa', 'media', 'alta');
CREATE TYPE public.task_status AS ENUM ('novo', 'pendente', 'em_progresso', 'aguarda_cliente', 'aguarda_pecas', 'concluido', 'faturado');
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  priority public.task_priority NOT NULL DEFAULT 'media',
  status public.task_status NOT NULL DEFAULT 'novo',
  expected_date DATE,
  completed_date DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- WORK LOGS TABLE
CREATE TABLE public.work_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours INTEGER NOT NULL DEFAULT 0,
  minutes INTEGER NOT NULL DEFAULT 0,
  deduct_from_contract BOOLEAN NOT NULL DEFAULT false,
  hourly_rate NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to work_logs" ON public.work_logs FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_work_logs_updated_at BEFORE UPDATE ON public.work_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- EQUIPMENT TABLE
CREATE TYPE public.equipment_type AS ENUM ('PC', 'NAS', 'Router', 'Switch', 'CCTV', 'Servidor');
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type public.equipment_type NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT,
  install_date DATE,
  warranty_end DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to equipment" ON public.equipment FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TECHNICAL NOTES TABLE
CREATE TABLE public.technical_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'geral',
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.technical_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to technical_notes" ON public.technical_notes FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_technical_notes_updated_at BEFORE UPDATE ON public.technical_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INVOICES TABLE
CREATE TYPE public.invoice_status AS ENUM ('rascunho', 'emitida', 'paga', 'cancelada');
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  status public.invoice_status NOT NULL DEFAULT 'rascunho',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INVOICE ITEMS TABLE
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  work_log_id UUID REFERENCES public.work_logs(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  hours NUMERIC(8,2) NOT NULL DEFAULT 0,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to invoice_items" ON public.invoice_items FOR ALL USING (true) WITH CHECK (true);

-- INDEXES
CREATE INDEX idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_expected_date ON public.tasks(expected_date);
CREATE INDEX idx_work_logs_task_id ON public.work_logs(task_id);
CREATE INDEX idx_work_logs_client_id ON public.work_logs(client_id);
CREATE INDEX idx_work_logs_date ON public.work_logs(date);
CREATE INDEX idx_equipment_client_id ON public.equipment(client_id);
CREATE INDEX idx_contracts_client_id ON public.contracts(client_id);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_technical_notes_client_id ON public.technical_notes(client_id);
