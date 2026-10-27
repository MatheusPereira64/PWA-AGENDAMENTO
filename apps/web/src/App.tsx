import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/shell'
import { AuthProvider, RequireAuth } from '@/lib/auth'
import { AgendaPage } from '@/pages/agenda'
import {
  BookingPage,
  ConfirmationPage,
  ManageAppointmentPage,
  OfflinePage,
} from '@/pages/booking'
import { DashboardPage } from '@/pages/dashboard'
import {
  ForgotPasswordPage,
  LandingPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
} from '@/pages/marketing'
import {
  AuditPage,
  CustomerDetailPage,
  CustomersPage,
  ProfessionalsPage,
  ServicesPage,
  SettingsPage,
} from '@/pages/records'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/entrar" element={<LoginPage />} />
            <Route path="/cadastrar" element={<RegisterPage />} />
            <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
            <Route path="/b/:slug" element={<BookingPage />} />
            <Route path="/b/:slug/confirmacao" element={<ConfirmationPage />} />
            <Route path="/b/:slug/agendamento/:id" element={<ManageAppointmentPage />} />
            <Route path="/offline" element={<OfflinePage />} />
            <Route
              path="/app"
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="agenda" element={<AgendaPage />} />
              <Route path="clientes" element={<CustomersPage />} />
              <Route path="clientes/:id" element={<CustomerDetailPage />} />
              <Route path="servicos" element={<ServicesPage />} />
              <Route path="profissionais" element={<ProfessionalsPage />} />
              <Route path="configuracoes" element={<SettingsPage />} />
              <Route path="auditoria" element={<AuditPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  )
}
