import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';

// Lazy loaded pages
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const TicketListPage = lazy(() => import('@/features/tickets/TicketListPage'));
const TicketDetailPage = lazy(() => import('@/features/tickets/TicketDetailPage'));
const CreateTicketPage = lazy(() => import('@/features/tickets/CreateTicketPage'));
const KanbanPage = lazy(() => import('@/features/tickets/KanbanPage'));
const EngineersPage = lazy(() => import('@/features/engineers/EngineersPage'));
const FieldVisitsPage = lazy(() => import('@/features/engineers/FieldVisitsPage'));
const AssetsPage = lazy(() => import('@/features/assets/AssetsPage'));
const AMCContractsPage = lazy(() => import('@/features/amc/AMCContractsPage'));
const InventoryPage = lazy(() => import('@/features/inventory/InventoryPage'));
const KnowledgeBasePage = lazy(() => import('@/features/knowledge-base/KnowledgeBasePage'));
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'));
const SettingsPage = lazy(() => import('@/features/admin/SettingsPage'));
const MastersPage = lazy(() => import('@/features/admin/MastersPage'));

// Placeholder page for remaining static views
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex h-full items-center justify-center p-8 animate-fade-in">
    <div className="glass rounded-xl p-12 text-center max-w-md">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground">This module is currently active.</p>
    </div>
  </div>
);

// Create TanStack Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Authentication Guard Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Theme Provider Component
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useUIStore();
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);
  
  return <>{children}</>;
};

export function App() {
  const { checkSession } = useAuthStore();

  // Active 10-minute inactivity auto-logout hook
  useInactivityTimer();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={
            <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<PlaceholderPage title="Register" />} />
              <Route path="/forgot-password" element={<PlaceholderPage title="Forgot Password" />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                
                {/* Tickets */}
                <Route path="tickets" element={<TicketListPage />} />
                <Route path="tickets/new" element={<CreateTicketPage />} />
                <Route path="tickets/:id" element={<TicketDetailPage />} />
                <Route path="tickets/kanban" element={<KanbanPage />} />
                
                {/* Field Operations */}
                <Route path="engineers" element={<EngineersPage />} />
                <Route path="field-visits" element={<FieldVisitsPage />} />
                
                {/* Assets & AMC */}
                <Route path="assets" element={<AssetsPage />} />
                <Route path="assets/:id" element={<AssetsPage />} />
                <Route path="amc" element={<AMCContractsPage />} />
                
                {/* Inventory, KB, Admin Masters, Reports & Settings */}
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="knowledge-base" element={<KnowledgeBasePage />} />
                <Route path="admin/masters" element={<MastersPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                
                {/* Catch all redirects to login if unauthenticated or dashboard if authenticated */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster position="top-right" theme="system" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
