import { useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores/ui-store';
import { Search, Bell, Sun, Moon, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const { theme, setTheme, setNotificationPanelOpen, toggleSidebar } = useUIStore();
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
            placeholder="Search tickets, assets, engineers... (Cmd+K)" 
            className="w-full bg-secondary/50 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-full py-1.5 pl-9 pr-4 text-sm transition-all outline-none"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-background border border-border px-1.5 rounded text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center justify-end gap-2 flex-1">
        <button 
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors relative overflow-hidden group"
          title="Toggle Theme"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Sun className={cn("absolute w-5 h-5 transition-all duration-300", theme === 'dark' ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100")} />
            <Moon className={cn("absolute w-5 h-5 transition-all duration-300", theme === 'light' ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100")} />
          </div>
        </button>

        <button 
          onClick={() => setNotificationPanelOpen(true)}
          className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card animate-pulse-glow" />
        </button>
      </div>
      
    </header>
  );
}
