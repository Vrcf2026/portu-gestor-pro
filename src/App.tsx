import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import Tasks from "@/pages/Tasks";
import Equipment from "@/pages/Equipment";
import CalendarPage from "@/pages/CalendarPage";
import ContractsPage from "@/pages/ContractsPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tarefas" element={<Tasks />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/equipamentos" element={<Equipment />} />
            <Route path="/contratos" element={<ContractsPage />} />
            <Route path="/calendario" element={<CalendarPage />} />
            <Route path="/relatorios" element={<PlaceholderPage title="Relatórios" description="Relatórios mensais por cliente com exportação PDF/CSV." />} />
            <Route path="/faturacao" element={<PlaceholderPage title="Faturação" description="Faturação automática por cliente com histórico." />} />
            <Route path="/portal" element={<PlaceholderPage title="Portal do Cliente" description="Portal seguro para clientes consultarem tarefas e faturas." />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
