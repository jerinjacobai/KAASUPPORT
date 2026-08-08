import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Map, 
  Package, 
  FileText, 
  Database, 
  BookOpen, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

const NAVIGATION_ITEMS = [
  { group: 'Overview', items: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ]},
  { group: 'Service Management', items: [
    { name: 'Tickets', path: '/tickets', icon: Ticket, badge: 12 },
    { name: 'Engineers', path: '/engineers', icon: Users },
    { name: 'Field Visits', path: '/field-visits', icon: Map },
  ]},
  { group: 'Resources', items: [
    { name: 'Assets', path: '/assets', icon: Package },
    { name: 'AMC Contracts', path: '/amc', icon: FileText },
    { name: 'Inventory', path: '/inventory', icon: Database },
  ]},
  { group: 'System', items: [
    { name: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]}
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, signOut } = useAuthStore();
  const location = useLocation();

  return (
    <aside className="h-full flex flex-col glass text-card-foreground">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
        <div className={cn("flex items-center gap-3 overflow-hidden", sidebarCollapsed ? "justify-center w-full" : "")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <span className="font-bold text-white leading-none">K</span>
          </div>
          {!sidebarCollapsed && (
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-500 whitespace-nowrap">
              KAA Support
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {NAVIGATION_ITEMS.map((group, i) => (
          <div key={i} className="flex flex-col gap-1">
            {!sidebarCollapsed && (
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {group.group}
              </span>
            )}
            
            {group.items.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={sidebarCollapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 group relative",
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  
                  {!sidebarCollapsed && (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}
                  
                  {item.badge && !sidebarCollapsed && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  
                  {item.badge && sidebarCollapsed && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile & Actions */}
      <div className="border-t border-border p-3 shrink-0">
        <button 
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 mb-3 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        <div className={cn("flex items-center gap-3", sidebarCollapsed ? "justify-center" : "px-2")}>
          <div className="w-9 h-9 rounded-full bg-secondary overflow-hidden shrink-0 border border-border">
            <img src={`https://ui-avatars.com/api/?name=${user?.email}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="text-sm font-medium truncate">{user?.email || 'User'}</span>
              <span className="text-xs text-muted-foreground truncate">Admin</span>
            </div>
          )}
          
          {!sidebarCollapsed && (
            <button 
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
