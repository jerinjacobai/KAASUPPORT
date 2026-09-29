import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import type { MenuId } from '@/types/permissions';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Map, 
  Package, 
  FileText, 
  BookOpen, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  PlusCircle,
  FolderTree,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface NavItem {
  id: MenuId;
  name: string;
  path: string;
  icon: any;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, isKaaInternal, userCompany, roleName, roleTier, hasMenuAccess, signOut } = useAuthStore();
  const location = useLocation();

  // All system navigation items mapped with unique menu IDs
  const allNavigationGroups: NavGroup[] = [
    { 
      group: 'Overview', 
      items: [
        { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ]
    },
    { 
      group: 'Support Desk', 
      items: [
        { id: 'tickets', name: isKaaInternal ? 'All Tickets' : 'My Tickets', path: '/tickets', icon: Ticket },
        { id: 'tickets_new', name: 'Raise Ticket', path: '/tickets/new', icon: PlusCircle },
        { id: 'engineers', name: 'Engineers', path: '/engineers', icon: Users },
        { id: 'field_visits', name: 'Field Visits', path: '/field-visits', icon: Map },
      ]
    },
    { 
      group: 'Assets & Contracts', 
      items: [
        { id: 'assets', name: isKaaInternal ? 'All Assets' : 'My Assets', path: '/assets', icon: Package },
        { id: 'amc', name: 'AMC Contracts', path: '/amc', icon: FileText },
      ]
    },
    { 
      group: 'Administration & Masters', 
      items: [
        { id: 'company_master', name: 'Company Master', path: '/admin/masters?tab=companies', icon: Building2 },
        { id: 'admin_masters', name: 'Admin Masters', path: '/admin/masters', icon: FolderTree },
        { id: 'reports', name: 'Reports', path: '/reports', icon: BarChart3 },
        { id: 'settings', name: 'Settings', path: '/settings', icon: Settings },
      ]
    },
    { 
      group: 'Help & Knowledge', 
      items: [
        { id: 'knowledge_base', name: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen },
      ]
    }
  ];

  // Dynamically filter navigation items based on active user's permissions
  const visibleGroups = allNavigationGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => hasMenuAccess(item.id))
    }))
    .filter(group => group.items.length > 0);

  // User display name and role badge formatting
  const displayName = user?.user_metadata?.full_name || (isKaaInternal ? 'KAA Team Member' : 'Client User');
  const roleDisplay = roleName || (roleTier === 'super_admin' ? 'Super Admin' : (isKaaInternal ? 'Staff' : 'Client Requester'));

  return (
    <aside className="h-full flex flex-col bg-card border-r border-border/80 text-card-foreground relative z-10 select-none">
      {/* Subtle top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-primary/[0.045] to-transparent pointer-events-none -z-10" />
      
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
        <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm shadow-primary/20 shrink-0">
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
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors hidden lg:block"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {visibleGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!sidebarCollapsed && (
              <h4 className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {group.group}
              </h4>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isExactSearch = item.path.includes('?');
              const currentUrl = `${location.pathname}${location.search}`;
              const isActive = isExactSearch 
                ? currentUrl === item.path 
                : (location.pathname === item.path || (item.path !== '/dashboard' && !location.search && location.pathname.startsWith(item.path)));
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group relative overflow-hidden",
                    isActive ? 
                    "bg-primary/[0.09] text-foreground font-semibold" :
                    "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  )}
                >
                  {isActive && <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-full" />}
                  <Icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  {!sidebarCollapsed && (
                    <span className="truncate flex-1">{item.name}</span>
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
                <div className={cn(
                  "w-9 h-9 rounded-full border flex items-center justify-center font-bold text-sm shadow-inner shrink-0",
                  roleTier === 'super_admin' ? "bg-red-500/10 border-red-500/30 text-red-400" :
                  roleTier === 'admin' ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                  "bg-primary/10 border-primary/20 text-primary"
                )}>
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full"></div>
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold truncate text-foreground leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                  {roleTier === 'super_admin' ? (
                    <ShieldCheck className="w-3 h-3 text-red-400 shrink-0" />
                  ) : roleTier === 'admin' ? (
                    <UserCheck className="w-3 h-3 text-amber-400 shrink-0" />
                  ) : (
                    <Building2 className="w-3 h-3 text-primary/70 shrink-0" />
                  )}
                  <span className="truncate">
                    {roleTier === 'super_admin' ? 'Super Admin (*)' : `${roleDisplay}${userCompany ? ` • ${userCompany}` : ''}`}
                  </span>
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
