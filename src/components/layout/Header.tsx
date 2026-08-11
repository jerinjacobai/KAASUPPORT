import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  Lock, 
  Globe, 
  FileText, 
  Users, 
  Package, 
  Shield, 
  Settings, 
  Building2, 
  BarChart3, 
  PlusCircle, 
  X,
  LayoutDashboard,
  Cpu,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { mockTickets, mockAssets, mockEngineers } from '@/lib/mock-data';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';

export function Header() {
  const { theme, setTheme, setNotificationPanelOpen, toggleSidebar } = useUIStore();
  const { isKaaInternal, userCompany } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Cmd+K / Ctrl+K
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

  // Quick navigation items
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', category: 'Navigation' },
    { name: 'All Support Tickets', icon: FileText, path: '/tickets', category: 'Navigation' },
    { name: 'Raise Support Ticket', icon: PlusCircle, path: '/tickets/new', category: 'Navigation' },
    { name: 'Kanban Visual Board', icon: LayoutDashboard, path: '/tickets/kanban', category: 'Navigation' },
    { name: 'Engineers & Dispatch', icon: Users, path: '/engineers', category: 'Navigation' },
    { name: 'Field Visit Schedules', icon: Building2, path: '/field-visits', category: 'Navigation' },
    { name: 'Assets & Machinery', icon: Package, path: '/assets', category: 'Navigation' },
    { name: 'AMC Contracts', icon: Shield, path: '/amc', category: 'Navigation' },
    { name: 'Inventory & Parts', icon: Cpu, path: '/inventory', category: 'Navigation' },
    { name: 'Knowledge Base', icon: BookOpen, path: '/knowledge-base', category: 'Navigation' },
    { name: 'Executive Reports', icon: BarChart3, path: '/reports', category: 'Navigation' },
    { name: 'Admin Master Config', icon: Building2, path: '/admin/masters', category: 'Navigation' },
    { name: 'System Settings', icon: Settings, path: '/settings', category: 'Navigation' },
  ];

  // Live filter data
  const query = searchQuery.trim().toLowerCase();

  const matchingTickets = query 
    ? mockTickets.filter(t => 
        t.id.toLowerCase().includes(query) || 
        t.title.toLowerCase().includes(query) || 
        t.company.toLowerCase().includes(query)
      ).slice(0, 5)
    : [];

  const matchingAssets = query
    ? mockAssets.filter(a => 
        a.tag.toLowerCase().includes(query) || 
        a.name.toLowerCase().includes(query) || 
        a.company.toLowerCase().includes(query) ||
        a.model.toLowerCase().includes(query)
      ).slice(0, 4)
    : [];

  const matchingEngineers = query
    ? mockEngineers.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.role.toLowerCase().includes(query) ||
        e.skills.some((s: string) => s.toLowerCase().includes(query))
      ).slice(0, 3)
    : [];

  const matchingNavItems = query
    ? navItems.filter(item => item.name.toLowerCase().includes(query))
    : navItems.slice(0, 6); // Default top shortcuts

  // Breadcrumb generator
  const paths = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = paths.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '));

  return (
    <header className="h-16 border-b border-border glass sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shrink-0">
      
      {/* Left section - Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button 
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          onClick={toggleSidebar}
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:flex items-center text-xs text-muted-foreground truncate">
          <span className="font-semibold text-primary">KAA</span>
          <span className="mx-2 text-border">/</span>
          {breadcrumbs.length === 0 ? (
            <span className="text-foreground font-semibold">Dashboard</span>
          ) : (
            breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center">
                {idx > 0 && <span className="mx-1.5 text-border">/</span>}
                <span className={idx === breadcrumbs.length - 1 ? "text-foreground font-semibold" : ""}>
                  {crumb}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Center section - Interactive Command Palette Search Trigger */}
      <div className="flex-1 max-w-md mx-2">
        <button 
          type="button"
          onClick={() => setSearchOpen(true)}
          className="w-full bg-secondary/40 hover:bg-secondary/70 border border-border hover:border-primary/40 rounded-full py-1.5 pl-3.5 pr-3 text-xs text-muted-foreground flex items-center justify-between transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            <span className="truncate">Search tickets, assets, serial #...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground shadow-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section - Tenant Scope & Actions */}
      <div className="flex items-center justify-end gap-2 flex-1">
        
        {/* RLS Multi-Tenant Scope Badge */}
        {isKaaInternal ? (
          <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 text-[11px] py-1 border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
            <Globe className="w-3 h-3 text-indigo-400" /> Admin Scope
          </Badge>
        ) : (
          <Badge variant="outline" className="flex items-center gap-1.5 text-[11px] py-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold truncate max-w-[140px] sm:max-w-none">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" /> {userCompany}
          </Badge>
        )}

        {/* Notifications Button */}
        <button 
          onClick={() => setNotificationPanelOpen(true)}
          className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/60 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* Theme Toggle Button */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/60 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>

      </div>

      {/* Spotlight Command Palette Search Modal */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="p-0 border-border bg-card text-card-foreground max-w-2xl gap-0 overflow-hidden shadow-2xl rounded-2xl">
          
          {/* Search Header Input */}
          <div className="flex items-center px-4 py-3.5 border-b border-border bg-secondary/30">
            <Search className="w-5 h-5 text-primary mr-3 shrink-0" />
            <input 
              ref={inputRef}
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base font-medium"
              placeholder="Search tickets (e.g. TKT-1004), assets, engineers, or modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ESC
              </kbd>
            )}
          </div>

          {/* Search Results Area */}
          <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4 custom-scrollbar">
            
            {/* Group 1: Tickets */}
            {matchingTickets.length > 0 && (
              <div className="space-y-1.5">
                <div className="px-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" /> Support Tickets ({matchingTickets.length})
                </div>
                {matchingTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      navigate(`/tickets/${t.id}`);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/60 transition-all cursor-pointer border border-transparent hover:border-primary/20 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-primary shrink-0">{t.id}</span>
                      <span className="text-xs font-semibold text-foreground truncate">{t.title}</span>
                      <span className="text-[10px] text-muted-foreground hidden md:inline-block truncate">({t.company})</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Group 2: Assets */}
            {matchingAssets.length > 0 && (
              <div className="space-y-1.5">
                <div className="px-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-400" /> Equipment & Machinery ({matchingAssets.length})
                </div>
                {matchingAssets.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      navigate('/assets');
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/60 transition-all cursor-pointer border border-transparent hover:border-emerald-500/20 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-emerald-400 shrink-0">{a.tag}</span>
                      <span className="text-xs font-semibold text-foreground truncate">{a.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate">{a.model}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                      {a.company}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Group 3: Engineers */}
            {matchingEngineers.length > 0 && (
              <div className="space-y-1.5">
                <div className="px-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" /> Field Engineers ({matchingEngineers.length})
                </div>
                {matchingEngineers.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => {
                      navigate('/engineers');
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/60 transition-all cursor-pointer border border-transparent hover:border-amber-500/20 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={e.avatar} alt="" className="w-6 h-6 rounded-full border border-border" />
                      <div>
                        <div className="text-xs font-semibold text-foreground">{e.name}</div>
                        <div className="text-[10px] text-muted-foreground">{e.role} • {e.location}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
                      {e.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Group 4: Navigation Shortcuts */}
            <div className="space-y-1.5">
              <div className="px-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {query ? 'Module Navigation' : 'Quick Access Shortcuts'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {matchingNavItems.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      navigate(item.path);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-secondary/80 text-foreground transition-colors group text-left border border-border/40 hover:border-primary/30"
                  >
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Empty Search Result Fallback */}
            {query && matchingTickets.length === 0 && matchingAssets.length === 0 && matchingEngineers.length === 0 && matchingNavItems.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-primary" />
                <p className="font-semibold text-foreground">No matches found for "{searchQuery}"</p>
                <p className="text-xs text-muted-foreground mt-1">Try searching for a ticket ID like "TKT-1004" or asset tag "AST".</p>
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="px-4 py-2.5 border-t border-border bg-secondary/20 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Tip: Press <kbd className="px-1 py-0.5 bg-background border rounded font-mono">⌘K</kbd> anywhere to open search</span>
            <span className="text-primary font-semibold">KAA Enterprise Support</span>
          </div>

        </DialogContent>
      </Dialog>
    </header>
  );
}
