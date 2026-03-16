import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import ClientDetailPage from "@/pages/ClientDetailPage";
import Tasks from "@/pages/Tasks";
import Equipment from "@/pages/Equipment";
import CalendarPage from "@/pages/CalendarPage";
import ContractsPage from "@/pages/ContractsPage";
import InvoicesPage from "@/pages/InvoicesPage";
import ReportsPage from "@/pages/ReportsPage";
import QuickEntryPage from "@/pages/QuickEntryPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <AppLayout />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/index" element={<AuthPage />} />
            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tarefas" element={<Tasks />} />
              <Route path="/clientes" element={<Clients />} />
              <Route path="/clientes/:id" element={<ClientDetailPage />} />
              <Route path="/equipamentos" element={<Equipment />} />
              <Route path="/contratos" element={<ContractsPage />} />
              <Route path="/calendario" element={<CalendarPage />} />
              <Route path="/relatorios" element={<ReportsPage />} />
              <Route path="/faturacao" element={<InvoicesPage />} />
              <Route path="/registo-rapido" element={<QuickEntryPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
