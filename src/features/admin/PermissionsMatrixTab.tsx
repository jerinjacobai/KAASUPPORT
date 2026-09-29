import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  Users, 
  Lock, 
  RotateCcw, 
  Check, 
  Search, 
  Filter, 
  CheckCircle2, 
  Building2,
  Sparkles,
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Map,
  Package,
  FileText,
  FolderTree,
  BarChart3,
  Settings,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useMasterStore, type UserMaster } from '@/stores/master-store';
import { useAuthStore } from '@/stores/auth-store';
import { 
  MENU_DEFINITIONS, 
  ALL_ROLES, 
  DEFAULT_ROLE_PERMISSIONS, 
  getRoleInfo, 
  type MenuId 
} from '@/types/permissions';

// Map menu IDs to their corresponding Lucide icons
const MENU_ICONS: Record<MenuId, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  tickets: Ticket,
  tickets_new: PlusCircle,
  engineers: Users,
  field_visits: Map,
  assets: Package,
  amc: FileText,
  company_master: Building2,
  admin_masters: FolderTree,
  reports: BarChart3,
  settings: Settings,
  knowledge_base: BookOpen
};

export function PermissionsMatrixTab() {
  const { 
    users: usersList, 
    companies: companiesList,
    rolePermissions, 
    userPermissions, 
    updateRolePermissions, 
    updateUserPermissions, 
    resetUserPermissions, 
    resetRolePermissionsToDefault,
    getUserEffectivePermissions 
  } = useMasterStore();

  const { checkSession } = useAuthStore();

  // Mode: 'role_matrix' | 'user_matrix'
  const [viewMode, setViewMode] = useState<'role_matrix' | 'user_matrix'>('role_matrix');

  // Role Matrix Filters
  const [roleTierFilter, setRoleTierFilter] = useState<'all' | 'super_admin' | 'admin' | 'user'>('all');
  const [savingRole, setSavingRole] = useState<string | null>(null);

  // User Matrix Filters
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userCompanyFilter, setUserCompanyFilter] = useState<string>('all');

  // Selected User Modal for Permission Customization
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<UserMaster | null>(null);
  const [userPermsModalOpen, setUserPermsModalOpen] = useState(false);
  const [tempUserMenuSelection, setTempUserMenuSelection] = useState<string[]>([]);
  const [isSavingUserPerms, setIsSavingUserPerms] = useState(false);

  // Filter roles based on tier
  const filteredRoles = ALL_ROLES.filter(r => {
    if (roleTierFilter === 'all') return true;
    return r.tier === roleTierFilter;
  });

  // Filter users based on search, role, and company
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.mappedCompany.toLowerCase().includes(userSearchTerm.toLowerCase());
    
    const matchesRole = userRoleFilter === 'all' || u.roleName === userRoleFilter;
    const matchesCompany = userCompanyFilter === 'all' || u.mappedCompany === userCompanyFilter;

    return matchesSearch && matchesRole && matchesCompany;
  });

  // Handlers for Role-Level Permissions
  const handleToggleRoleMenu = async (roleName: string, menuId: string, currentChecked: boolean) => {
    if (roleName === 'Super Admin') {
      toast.info('Super Admin retains whole admin scope (*)', {
        description: 'Super Admin permissions are locked and cannot be removed.'
      });
      return;
    }

    const currentMenus = rolePermissions[roleName] || DEFAULT_ROLE_PERMISSIONS[roleName] || [];
    let updatedMenus: string[];

    if (currentChecked) {
      updatedMenus = currentMenus.filter(m => m !== menuId);
    } else {
      updatedMenus = [...currentMenus, menuId];
    }

    try {
      await updateRolePermissions(roleName, updatedMenus);
      checkSession();
    } catch {
      toast.error('Failed to update role permission');
    }
  };

  const handleSelectAllForRole = async (roleName: string) => {
    if (roleName === 'Super Admin') return;
    setSavingRole(roleName);
    try {
      const allMenus = MENU_DEFINITIONS.map(m => m.id);
      await updateRolePermissions(roleName, allMenus);
      checkSession();
      toast.success(`Granted all ${allMenus.length} menus to ${roleName}`);
    } catch {
      toast.error('Failed to grant all menus');
    } finally {
      setSavingRole(null);
    }
  };

  const handleClearAllForRole = async (roleName: string) => {
    if (roleName === 'Super Admin') return;
    setSavingRole(roleName);
    try {
      // Keep dashboard as minimal safe default
      const minimalMenus = ['dashboard'];
      await updateRolePermissions(roleName, minimalMenus);
      checkSession();
      toast.info(`Cleared menus for ${roleName} (Dashboard retained)`);
    } catch {
      toast.error('Failed to clear menus');
    } finally {
      setSavingRole(null);
    }
  };

  const handleResetRoleToDefault = async (roleName: string) => {
    if (roleName === 'Super Admin') return;
    setSavingRole(roleName);
    try {
      await resetRolePermissionsToDefault(roleName);
      checkSession();
      toast.success(`Reset ${roleName} to default permissions`);
    } catch {
      toast.error('Failed to reset role permissions');
    } finally {
      setSavingRole(null);
    }
  };

  // Handlers for User-Level Overrides
  const handleOpenUserPermsModal = (user: UserMaster) => {
    setSelectedUserForPerms(user);
    const effective = getUserEffectivePermissions(user);
    setTempUserMenuSelection(effective);
    setUserPermsModalOpen(true);
  };

  const handleToggleTempUserMenu = (menuId: string) => {
    if (selectedUserForPerms?.roleName === 'Super Admin') {
      toast.info('Super Admin retains full system scope (*)');
      return;
    }

    setTempUserMenuSelection(prev => 
      prev.includes(menuId) ? prev.filter(m => m !== menuId) : [...prev, menuId]
    );
  };

  const handleSaveUserPermissions = async () => {
    if (!selectedUserForPerms) return;
    if (selectedUserForPerms.roleName === 'Super Admin') {
      setUserPermsModalOpen(false);
      return;
    }

    setIsSavingUserPerms(true);
    try {
      await updateUserPermissions(selectedUserForPerms.id, tempUserMenuSelection);
      checkSession();
      toast.success(`Custom permissions applied for ${selectedUserForPerms.name}`, {
        description: `${tempUserMenuSelection.length} menu(s) enabled for this user.`
      });
      setUserPermsModalOpen(false);
    } catch {
      toast.error('Failed to save user permissions');
    } finally {
      setIsSavingUserPerms(false);
    }
  };

  const handleResetUserToRoleDefault = async () => {
    if (!selectedUserForPerms) return;
    setIsSavingUserPerms(true);
    try {
      await resetUserPermissions(selectedUserForPerms.id);
      checkSession();
      toast.success(`Reset ${selectedUserForPerms.name} to role defaults`, {
        description: `Now inheriting standard permissions for ${selectedUserForPerms.roleName}.`
      });
      setUserPermsModalOpen(false);
    } catch {
      toast.error('Failed to reset user permissions');
    } finally {
      setIsSavingUserPerms(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tier Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1: Super Admin */}
        <div className="rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/10 via-card to-card p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                  Tier 1 • Master Scope
                </span>
                <Badge variant="destructive" className="text-[10px] gap-1 px-1.5 py-0">
                  <Lock className="w-2.5 h-2.5" /> Full Scope
                </Badge>
              </div>
              <h3 className="text-base font-bold text-foreground">Super Admin</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Unrestricted whole admin scope (*). All 12 system menus are permanently unlocked and immutable.
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Scope:</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 12 / 12 Menus Enabled
            </span>
          </div>
        </div>

        {/* Tier 2: Admin User Types */}
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Tier 2 • Elevated Admin
                </span>
                <Badge variant="warning" className="text-[10px] gap-1 px-1.5 py-0">
                  <Sparkles className="w-2.5 h-2.5" /> Configurable
                </Badge>
              </div>
              <h3 className="text-base font-bold text-foreground">Admin User Types</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Support Manager, Service Coordinator & Company Admin. Set which specific menus each role or user can access.
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Roles Included:</span>
            <span className="font-semibold text-foreground">3 Admin Roles</span>
          </div>
        </div>

        {/* Tier 3: Normal Users */}
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  Tier 3 • Operational
                </span>
                <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0">
                  <Users className="w-2.5 h-2.5" /> Configurable
                </Badge>
              </div>
              <h3 className="text-base font-bold text-foreground">Normal Users</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Senior Field Engineers, Plant Managers & Client Requesters. Granularly grant operational menus as required.
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Roles Included:</span>
            <span className="font-semibold text-foreground">3 User Roles</span>
          </div>
        </div>
      </div>

      {/* Main View Mode Selector (Role vs Permissions & User vs Permissions) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/30 p-2.5 rounded-xl border border-border">
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant={viewMode === 'role_matrix' ? 'default' : 'ghost'}
            onClick={() => setViewMode('role_matrix')}
            className="text-xs gap-2 font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Role vs Menu Permissions
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'user_matrix' ? 'default' : 'ghost'}
            onClick={() => setViewMode('user_matrix')}
            className="text-xs gap-2 font-semibold"
          >
            <Users className="w-3.5 h-3.5" /> User vs Permissions ({usersList.length})
          </Button>
        </div>

        {viewMode === 'role_matrix' ? (
          /* Role Tier Filter Tabs */
          <div className="flex items-center gap-1 overflow-x-auto">
            <Button
              size="sm"
              variant={roleTierFilter === 'all' ? 'secondary' : 'ghost'}
              onClick={() => setRoleTierFilter('all')}
              className="text-[11px] h-7 px-2.5"
            >
              All Roles ({ALL_ROLES.length})
            </Button>
            <Button
              size="sm"
              variant={roleTierFilter === 'super_admin' ? 'secondary' : 'ghost'}
              onClick={() => setRoleTierFilter('super_admin')}
              className="text-[11px] h-7 px-2.5 text-red-400"
            >
              Super Admin (1)
            </Button>
            <Button
              size="sm"
              variant={roleTierFilter === 'admin' ? 'secondary' : 'ghost'}
              onClick={() => setRoleTierFilter('admin')}
              className="text-[11px] h-7 px-2.5 text-amber-400"
            >
              Admin Roles (3)
            </Button>
            <Button
              size="sm"
              variant={roleTierFilter === 'user' ? 'secondary' : 'ghost'}
              onClick={() => setRoleTierFilter('user')}
              className="text-[11px] h-7 px-2.5 text-primary"
            >
              Normal Users (3)
            </Button>
          </div>
        ) : (
          /* User Matrix Search Info */
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Customize individual permissions per user
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: ROLE VS MENU PERMISSIONS MATRIX                                   */}
      {/* ========================================================================= */}
      {viewMode === 'role_matrix' && (
        <div className="space-y-6">
          {filteredRoles.map(role => {
            const isSuperAdmin = role.tier === 'super_admin';
            const currentMenus = isSuperAdmin 
              ? MENU_DEFINITIONS.map(m => m.id)
              : (rolePermissions[role.name] || DEFAULT_ROLE_PERMISSIONS[role.name] || []);
            const enabledCount = currentMenus.length;

            return (
              <div 
                key={role.name}
                className="rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all hover:border-border/80"
              >
                {/* Role Header */}
                <div className="p-4 bg-secondary/20 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-foreground">{role.name}</h4>
                      <Badge 
                        variant={role.tier === 'super_admin' ? 'destructive' : role.tier === 'admin' ? 'warning' : 'secondary'}
                        className="text-[10px] uppercase font-bold"
                      >
                        {role.tierLabel}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-md border border-border">
                        {role.accountScope}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {enabledCount} / {MENU_DEFINITIONS.length} Menus Visible
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>

                  {/* Actions for this role */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSuperAdmin ? (
                      <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg font-medium">
                        <Lock className="w-3.5 h-3.5" /> Full Scope (Protected)
                      </div>
                    ) : (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleSelectAllForRole(role.name)}
                          disabled={savingRole === role.name}
                          className="h-8 text-xs gap-1"
                        >
                          <Check className="w-3 h-3" /> Select All
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleClearAllForRole(role.name)}
                          disabled={savingRole === role.name}
                          className="h-8 text-xs gap-1 text-muted-foreground"
                        >
                          Clear
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleResetRoleToDefault(role.name)}
                          disabled={savingRole === role.name}
                          className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                          title="Reset to factory default permissions"
                        >
                          <RotateCcw className="w-3 h-3" /> Reset
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* 12 Menus Toggle Grid */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {MENU_DEFINITIONS.map(menu => {
                    const isChecked = currentMenus.includes(menu.id);
                    const MenuIcon = MENU_ICONS[menu.id] || FolderTree;

                    return (
                      <div 
                        key={menu.id}
                        className={`rounded-lg p-3 border transition-all flex items-start justify-between gap-3 ${
                          isChecked 
                            ? 'bg-secondary/40 border-primary/30 shadow-xs' 
                            : 'bg-background/40 border-border/50 opacity-60'
                        }`}
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <MenuIcon className={`w-4 h-4 shrink-0 ${isChecked ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="font-semibold text-xs text-foreground truncate">{menu.name}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{menu.description}</p>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-[9px] text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded">
                              {menu.path}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {menu.category}
                            </span>
                          </div>
                        </div>

                        <div className="pt-0.5 shrink-0">
                          <Switch 
                            checked={isChecked}
                            disabled={isSuperAdmin}
                            onCheckedChange={() => handleToggleRoleMenu(role.name, menu.id, isChecked)}
                            aria-label={`Toggle ${menu.name} for ${role.name}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: USER VS PERMISSIONS MATRIX (INDIVIDUAL OVERRIDES)                  */}
      {/* ========================================================================= */}
      {viewMode === 'user_matrix' && (
        <div className="space-y-4">
          {/* User Search & Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-secondary/20 p-3 rounded-xl border border-border">
            <div className="relative">
              <label htmlFor="user-search-input" className="sr-only">Search Users</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="user-search-input"
                name="userSearchTerm"
                type="text"
                placeholder="Search by name, email, or company..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div>
              <label htmlFor="user-role-filter" className="sr-only">Filter by Role</label>
              <select
                id="user-role-filter"
                name="userRoleFilter"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary text-foreground"
              >
                <option value="all">All Roles (All 7 Roles)</option>
                {ALL_ROLES.map(r => (
                  <option key={r.name} value={r.name}>{r.name} ({r.tierLabel})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="user-company-filter" className="sr-only">Filter by Company</label>
              <select
                id="user-company-filter"
                name="userCompanyFilter"
                value={userCompanyFilter}
                onChange={(e) => setUserCompanyFilter(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary text-foreground"
              >
                <option value="all">All Companies ({companiesList.length})</option>
                <option value="Global (All Companies)">Global (Internal Staff)</option>
                {companiesList.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* User Directory Table */}
          {filteredUsers.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center border border-border flex flex-col items-center justify-center">
              <Users className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <h4 className="text-base font-bold text-foreground">No Users Match Filter Criteria</h4>
              <p className="text-xs text-muted-foreground mt-1">Try clearing your search term or selecting another role/company filter.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
                      <th className="py-3 px-4">User Details</th>
                      <th className="py-3 px-4">Organization / Company</th>
                      <th className="py-3 px-4">Role & Tier</th>
                      <th className="py-3 px-4">Permissions Mode</th>
                      <th className="py-3 px-4">Visible Menus</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredUsers.map(user => {
                      const roleInfo = getRoleInfo(user.roleName);
                      const isSuperAdmin = roleInfo.tier === 'super_admin';
                      const hasOverride = Boolean(userPermissions[user.id] && userPermissions[user.id].length > 0);
                      const effectiveMenus = getUserEffectivePermissions(user);

                      return (
                        <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0 text-xs">
                                {user.name.slice(0, 1).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-foreground truncate">{user.name}</div>
                                <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-medium text-foreground">
                            <span className="flex items-center gap-1.5 truncate">
                              <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              {user.mappedCompany}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <Badge 
                                variant={roleInfo.tier === 'super_admin' ? 'destructive' : roleInfo.tier === 'admin' ? 'warning' : 'secondary'}
                                className="text-[10px] font-bold"
                              >
                                {roleInfo.tierLabel}
                              </Badge>
                              <span className="text-xs text-foreground font-medium">{user.roleName}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {isSuperAdmin ? (
                              <Badge variant="destructive" className="text-[10px] gap-1">
                                <Lock className="w-2.5 h-2.5" /> Full Scope
                              </Badge>
                            ) : hasOverride ? (
                              <Badge variant="warning" className="text-[10px] gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> Custom User Override
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Inheriting Role Defaults
                              </Badge>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-foreground text-xs">
                              {effectiveMenus.length} / {MENU_DEFINITIONS.length} Menus
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenUserPermsModal(user)}
                              className="h-7 text-xs gap-1.5"
                            >
                              <Settings className="w-3 h-3" /> Set Permissions
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CUSTOMIZE INDIVIDUAL USER PERMISSIONS                               */}
      {/* ========================================================================= */}
      {selectedUserForPerms && (
        <Dialog open={userPermsModalOpen} onOpenChange={setUserPermsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" />
                    Configure Permissions for {selectedUserForPerms.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {selectedUserForPerms.email} • {selectedUserForPerms.roleName} ({selectedUserForPerms.mappedCompany})
                  </DialogDescription>
                </div>
                <Badge 
                  variant={getRoleInfo(selectedUserForPerms.roleName).tier === 'super_admin' ? 'destructive' : getRoleInfo(selectedUserForPerms.roleName).tier === 'admin' ? 'warning' : 'secondary'}
                  className="uppercase text-[10px]"
                >
                  {getRoleInfo(selectedUserForPerms.roleName).tierLabel}
                </Badge>
              </div>
            </DialogHeader>

            {selectedUserForPerms.roleName === 'Super Admin' ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 my-2">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-red-400">Super Admin User (Full System Scope)</h5>
                  <p className="text-xs text-muted-foreground">
                    This user holds the Super Admin master role. All 12 portal menus and administration features are permanently granted and cannot be restricted.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 my-2">
                <div className="flex items-center justify-between bg-secondary/30 p-2.5 rounded-lg border border-border text-xs">
                  <span className="text-muted-foreground">
                    Enabled Menus: <strong className="text-foreground">{tempUserMenuSelection.length} of {MENU_DEFINITIONS.length}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setTempUserMenuSelection(MENU_DEFINITIONS.map(m => m.id))}
                      className="h-7 text-[11px]"
                    >
                      Select All
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setTempUserMenuSelection(['dashboard'])}
                      className="h-7 text-[11px]"
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResetUserToRoleDefault}
                      disabled={isSavingUserPerms}
                      className="h-7 text-[11px] gap-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    >
                      <RotateCcw className="w-3 h-3" /> Revert to Role Default
                    </Button>
                  </div>
                </div>

                {/* 12 Menus Checklist for User */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {MENU_DEFINITIONS.map(menu => {
                    const isChecked = tempUserMenuSelection.includes(menu.id);
                    const MenuIcon = MENU_ICONS[menu.id] || FolderTree;

                    return (
                      <div 
                        key={menu.id}
                        onClick={() => handleToggleTempUserMenu(menu.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start justify-between gap-2.5 ${
                          isChecked 
                            ? 'bg-secondary/40 border-primary/40' 
                            : 'bg-background/50 border-border/40 opacity-60'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <MenuIcon className={`w-3.5 h-3.5 ${isChecked ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="font-semibold text-xs text-foreground truncate">{menu.name}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{menu.description}</p>
                          <span className="text-[9px] text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded inline-block">
                            {menu.path}
                          </span>
                        </div>
                        <div className="pt-0.5">
                          <Switch 
                            checked={isChecked} 
                            onCheckedChange={() => handleToggleTempUserMenu(menu.id)}
                            aria-label={`Toggle ${menu.name}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setUserPermsModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              {selectedUserForPerms.roleName !== 'Super Admin' && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleSaveUserPermissions}
                  disabled={isSavingUserPerms}
                  className="text-xs gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Save User Permissions
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
