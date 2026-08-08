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
  LogOut,
  Building2,
  PlusCircle
} from 'lucide-react';

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, isKaaInternal, userCompany, signOut } = useAuthStore();
  const location = useLocation();

  // Navigation Items defined conditionally
  const navigationItems = [
    { group: 'Overview', items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ]},
    { group: 'Support Desk', items: [
      { name: isKaaInternal ? 'All Tickets' : 'My Tickets', path: '/tickets', icon: Ticket, badge: 12 },
      { name: 'Raise Ticket', path: '/tickets/new', icon: PlusCircle },
      ...(isKaaInternal ? [
        { name: 'Engineers', path: '/engineers', icon: Users },
        { name: 'Field Visits', path: '/field-visits', icon: Map },
      ] : []),
    ]},
    { group: 'Assets & Contracts', items: [
      { name: isKaaInternal ? 'All Assets' : 'My Assets', path: '/assets', icon: Package },
      { name: 'AMC Contracts', path: '/amc', icon: FileText },
      ...(isKaaInternal ? [
        { name: 'Inventory', path: '/inventory', icon: Database },
      ] : []),
    ]},
    { group: 'Help & Analytics', items: [
      { name: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen },
      ...(isKaaInternal ? [
        { name: 'Reports', path: '/reports', icon: BarChart3 },
        { name: 'Settings', path: '/settings', icon: Settings },
      ] : []),
    ]}
  ];

  return (
    <aside className="h-full flex flex-col glass text-card-foreground">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className={cn("flex items-center gap-3 overflow-hidden", sidebarCollapsed ? "justify-center w-full" : "")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <span className="font-bold text-white leading-none">K</span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-500 whitespace-nowrap">
                KAA Support
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {isKaaInternal ? 'Admin Portal' : 'Client Desk'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Client Mapped Company Banner if Client Mode */}
      {!isKaaInternal && userCompany && !sidebarCollapsed && (
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Mapped Client</p>
            <p className="text-xs font-bold text-primary truncate">{userCompany}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {navigationItems.map((group, i) => (
          <div key={i} className="flex flex-col gap-1">
            {!sidebarCollapsed && (
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
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
                    <span className="flex-1 truncate text-xs font-medium">{item.name}</span>
                  )}
                  
                  {item.badge && !sidebarCollapsed && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
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
          className="w-full flex items-center justify-center p-2 mb-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
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
              <span className="text-xs font-semibold truncate text-foreground">{user?.user_metadata?.full_name || user?.email || 'User'}</span>
              <span className="text-[10px] text-muted-foreground truncate">{isKaaInternal ? 'Super Admin' : userCompany}</span>
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
