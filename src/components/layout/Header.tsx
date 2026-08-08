import { useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { Search, Bell, Sun, Moon, Menu, Lock, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { theme, setTheme, setNotificationPanelOpen, toggleSidebar } = useUIStore();
  const { isKaaInternal, userCompany } = useAuthStore();
  const location = useLocation();
  
  // Create breadcrumbs based on pathname
  const paths = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = paths.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '));

  return (
    <header className="h-16 border-b border-border glass sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shrink-0">
      
      {/* Left section */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:flex items-center text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center">
              {idx > 0 && <span className="mx-2">/</span>}
              <span className={idx === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>
                {crumb}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Center section - Search */}
      <div className="flex-1 max-w-md hidden lg:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search tickets, assets, serial #... (Cmd+K)" 
            className="w-full bg-secondary/50 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-full py-1.5 pl-9 pr-4 text-sm transition-all outline-none"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-background border border-border px-1.5 rounded text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right section - Tenant Scope Indicator & Actions */}
      <div className="flex items-center justify-end gap-3 flex-1">
        
        {/* RLS Multi-Tenant Status Badge */}
        {isKaaInternal ? (
          <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 text-[11px] py-1 border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
            <Globe className="w-3 h-3 text-indigo-400" /> Admin Scope (All Clients)
          </Badge>
        ) : (
          <Badge variant="outline" className="flex items-center gap-1.5 text-[11px] py-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold">
            <Lock className="w-3 h-3 text-emerald-400" /> Mapped Scope: {userCompany}
          </Badge>
        )}

        <button 
          onClick={() => setNotificationPanelOpen(true)}
          className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

      </div>
    </header>
  );
}
