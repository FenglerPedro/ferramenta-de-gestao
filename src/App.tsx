import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import AuthGuard from "@/components/auth/AuthGuard";

// Pages
import Index from "./pages/Index";
import Agenda from "./pages/Agenda";
import Clientes from "./pages/Clientes";
import ClientProject from "./pages/ClientProject";
import Servicos from "./pages/Servicos";
import Configuracoes from "./pages/Configuracoes";
import CRM from "./pages/CRM";
import BookingPage from "./pages/BookingPage";
import NotFound from "./pages/NotFound";

// Auth Pages
import AuthLayout from "./pages/auth/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <BusinessProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Rotas Públicas de Auth */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route index element={<Navigate to="/auth/login" replace />} />
                </Route>

                {/* Rota Pública de Agendamento (Externo) */}
                <Route path="/agendar" element={<BookingPage />} />

                {/* Rotas Protegidas do Sistema */}
                <Route path="/" element={
                  <AuthGuard>
                    <Index />
                  </AuthGuard>
                } />
                <Route path="/agenda" element={
                  <AuthGuard>
                    <AppLayout><Agenda /></AppLayout>
                  </AuthGuard>
                } />
                <Route path="/clientes" element={
                  <AuthGuard>
                    <AppLayout><Clientes /></AppLayout>
                  </AuthGuard>
                } />
                <Route path="/clientes/:clientId/projeto" element={
                  <AuthGuard>
                    <AppLayout><ClientProject /></AppLayout>
                  </AuthGuard>
                } />
                <Route path="/servicos" element={
                  <AuthGuard>
                    <AppLayout><Servicos /></AppLayout>
                  </AuthGuard>
                } />
                <Route path="/crm" element={
                  <AuthGuard>
                    <AppLayout><CRM /></AppLayout>
                  </AuthGuard>
                } />
                <Route path="/configuracoes" element={
                  <AuthGuard>
                    <AppLayout><Configuracoes /></AppLayout>
                  </AuthGuard>
                } />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </BusinessProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
