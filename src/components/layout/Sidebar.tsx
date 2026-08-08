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
  PlusCircle,
  FolderTree
} from 'lucide-react';

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { isKaaInternal, userCompany, signOut } = useAuthStore();
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
        { name: 'Admin Masters', path: '/admin/masters', icon: FolderTree },
        { name: 'Reports', path: '/reports', icon: BarChart3 },
        { name: 'Settings', path: '/settings', icon: Settings },
      ] : []),
    ]}
  ];

  return (
    <aside className="h-full flex flex-col glass bg-background/80 backdrop-blur-xl border-r border-border text-card-foreground relative z-10">
      {/* Subtle top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none -z-10" />
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
        <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20 shrink-0">
            K
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-tight">KAA SUPPORT</span>
              <span className="text-[10px] text-muted-foreground font-medium">Enterprise ERP Portal</span>
            </div>
          )}
        </Link>
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors hidden lg:block"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {navigationItems.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!sidebarCollapsed && (
              <h4 className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {group.group}
              </h4>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative overflow-hidden",
                    isActive ? 
                    "bg-secondary/80 text-foreground font-semibold shadow-sm" : 
                    "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                  )}
                  <Icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  {!sidebarCollapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                  {!sidebarCollapsed && item.badge && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-auto",
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary border border-border text-muted-foreground"
                    )}>
                      {item.badge}
                    </span>
                  )}
                  {sidebarCollapsed ? (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                      {item.name}
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Scope & Logout Footer */}
      <div className="p-3 border-t border-border shrink-0 bg-secondary/10 backdrop-blur-md">
        {!sidebarCollapsed ? (
          <div className="flex items-center justify-between bg-secondary/30 p-2 rounded-xl border border-border/50 shadow-sm hover:border-border transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary shadow-inner shrink-0">
                  {isKaaInternal ? 'K' : (userCompany ? userCompany.slice(0, 2).toUpperCase() : 'C')}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full"></div>
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold truncate text-foreground leading-tight">
                  {isKaaInternal ? 'KAA Admin' : userCompany}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-primary/70" />
                  {isKaaInternal ? 'Super Admin' : 'Client Scope'}
                </span>
              </div>
            </div>
            <button 
              onClick={signOut}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={signOut}
            className="w-full flex justify-center p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
