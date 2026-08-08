import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { NotificationPanel } from './NotificationPanel';
import { cn } from '@/lib/utils';

export function DashboardLayout() {
  const { user } = useAuthStore();
  const { sidebarCollapsed, notificationPanelOpen, setNotificationPanelOpen } = useUIStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar - Desktop */}
      <div 
        className={cn(
          "hidden md:block h-full transition-all duration-300 ease-in-out border-r border-border shrink-0 z-20",
          sidebarCollapsed ? "w-[72px]" : "w-[280px]"
        )}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Header />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
          <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-fade-in max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notification Panel Drawer */}
      {notificationPanelOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setNotificationPanelOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full z-50 animate-slide-in-right">
            <NotificationPanel onClose={() => setNotificationPanelOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}
