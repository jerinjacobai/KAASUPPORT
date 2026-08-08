import { useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { Search, Bell, Sun, Moon, Menu, Lock, Globe, FileText, Users, Monitor, Shield, Settings, Briefcase, FileBarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';

export function Header() {
  const { theme, setTheme, setNotificationPanelOpen, toggleSidebar } = useUIStore();
  const { isKaaInternal, userCompany } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: Globe, path: '/', shortcut: 'D' },
    { name: 'Tickets', icon: FileText, path: '/tickets', shortcut: 'T' },
    { name: 'Engineers', icon: Users, path: '/engineers', shortcut: 'E' },
    { name: 'Assets', icon: Monitor, path: '/assets', shortcut: 'A' },
    { name: 'AMC', icon: Shield, path: '/amc', shortcut: 'M' },
    { name: 'Reports', icon: FileBarChart, path: '/reports', shortcut: 'R' },
    { name: 'Settings', icon: Settings, path: '/settings', shortcut: 'S' },
    { name: 'Admin Masters', icon: Briefcase, path: '/admin', shortcut: 'C' }
  ];

  const filteredNavItems = navItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
        <div 
          className="relative group cursor-text"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <div className="w-full bg-secondary/50 border border-border rounded-full py-1.5 pl-9 pr-4 text-sm text-muted-foreground flex items-center justify-between">
            <span>Search tickets, assets, serial #...</span>
            <kbd className="text-[10px] bg-background border border-border px-1.5 rounded text-muted-foreground">
              ⌘K
            </kbd>
          </div>
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

      {/* Command Palette Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="p-0 border-border bg-card max-w-xl gap-0 overflow-hidden shadow-2xl">
          <div className="flex items-center px-4 py-3 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <input 
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-lg"
              placeholder="Type a command or search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredNavItems.length === 0 ? (
              <div className="py-14 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            ) : (
              <div className="space-y-1">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Quick Navigation
                </div>
                {filteredNavItems.map((item) => (
                  <button
                    key={item.name}
                    className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-secondary/80 text-foreground transition-colors group"
                    onClick={() => {
                      navigate(item.path);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    {item.shortcut && (
                      <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
