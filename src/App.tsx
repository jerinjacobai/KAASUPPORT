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

// Permission Guard Component (Dynamically verifies user/role menu authorization)
const PermissionRoute = ({ menuId, children }: { menuId: string; children: React.ReactNode }) => {
  const { hasMenuAccess, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasMenuAccess(menuId)) {
    return <Navigate to="/dashboard" replace />;
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

import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useMasterStore } from '@/stores/master-store';

export function App() {
  const { checkSession } = useAuthStore();

  // Active 10-minute inactivity auto-logout hook
  useInactivityTimer();

  useEffect(() => {
    checkSession();
    useMasterStore.getState().purgeMockData();
    useMasterStore.getState().syncFromSupabase();
  }, [checkSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ErrorBoundary>
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
                <Route path="tickets" element={<PermissionRoute menuId="tickets"><TicketListPage /></PermissionRoute>} />
                <Route path="tickets/new" element={<PermissionRoute menuId="tickets_new"><CreateTicketPage /></PermissionRoute>} />
                <Route path="tickets/:id" element={<PermissionRoute menuId="tickets"><TicketDetailPage /></PermissionRoute>} />
                <Route path="tickets/kanban" element={<PermissionRoute menuId="tickets"><KanbanPage /></PermissionRoute>} />
                
                {/* Field Operations */}
                <Route path="engineers" element={<PermissionRoute menuId="engineers"><EngineersPage /></PermissionRoute>} />
                <Route path="field-visits" element={<PermissionRoute menuId="field_visits"><FieldVisitsPage /></PermissionRoute>} />
                
                {/* Assets & AMC */}
                <Route path="assets" element={<PermissionRoute menuId="assets"><AssetsPage /></PermissionRoute>} />
                <Route path="assets/:id" element={<PermissionRoute menuId="assets"><AssetsPage /></PermissionRoute>} />
                <Route path="amc" element={<PermissionRoute menuId="amc"><AMCContractsPage /></PermissionRoute>} />
                
                {/* KB, Admin Masters, Permissions, Reports & Settings */}
                <Route path="knowledge-base" element={<PermissionRoute menuId="knowledge_base"><KnowledgeBasePage /></PermissionRoute>} />
                <Route path="admin/masters" element={<PermissionRoute menuId="admin_masters"><MastersPage /></PermissionRoute>} />
                <Route path="admin/permissions" element={<Navigate to="/admin/masters?tab=permissions" replace />} />
                <Route path="permissions" element={<Navigate to="/admin/masters?tab=permissions" replace />} />
                <Route path="masters" element={<Navigate to="/admin/masters" replace />} />
                <Route path="admin/companies" element={<Navigate to="/admin/masters?tab=companies" replace />} />
                <Route path="companies" element={<Navigate to="/admin/masters?tab=companies" replace />} />
                <Route path="reports" element={<PermissionRoute menuId="reports"><ReportsPage /></PermissionRoute>} />
                <Route path="settings" element={<PermissionRoute menuId="settings"><SettingsPage /></PermissionRoute>} />
                
                {/* Catch all redirects to login if unauthenticated or dashboard if authenticated */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
            </Suspense>
          </BrowserRouter>
        </ErrorBoundary>
        <Toaster position="top-right" theme="system" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
