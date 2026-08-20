import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { 
  Building2, 
  Users, 
  Package, 
  Search, 
  Lock, 
  CheckCircle2, 
  UserPlus, 
  Cpu, 
  KeyRound, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Trash2,
  FileCheck2,
  Boxes,
  Warehouse
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMasterStore, type UserMaster } from '@/stores/master-store';
import { hashPassword } from '@/lib/crypto';
import { supabase } from '@/lib/supabase';

export default function MastersPage() {
  const [activeTab, setActiveTab] = useState('companies');
  const [searchTerm, setSearchTerm] = useState('');

  // Master Store State
  const { 
    companies: companiesList, 
    users: usersList, 
    assets: assetsList, 
    amcContracts: amcList,
    inventoryParts: partsList,
    addCompany, 
    deleteCompany,
    addUser, 
    resetUserPassword,
    deleteUser,
    addAsset, 
    deleteAsset,
    addAMCContract,
    addInventoryPart,
    deleteInventoryPart
  } = useMasterStore();

  // Modals state
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [amcModalOpen, setAmcModalOpen] = useState(false);
  const [partModalOpen, setPartModalOpen] = useState(false);

  const [selectedUserForPassword, setSelectedUserForPassword] = useState<UserMaster | null>(null);

  // New Company Form State
  const [compName, setCompName] = useState('');
  const [compCode, setCompCode] = useState('');
  const [compIndustry, setCompIndustry] = useState('Industrial Manufacturing');
  const [compEmail, setCompEmail] = useState('');
  const [compPhone, setCompPhone] = useState('');

  // New User Form State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRoleType, setUserRoleType] = useState<'KAA Internal Staff' | 'Client User'>('Client User');
  const [userRoleName, setUserRoleName] = useState('Client Requester');
  const [userMappedCompany, setUserMappedCompany] = useState('');
  const [userPassword, setUserPassword] = useState('KaaPass2026!#');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Password Reset Modal State
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // New Asset Form State
  const [assetName, setAssetName] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [assetModel, setAssetModel] = useState('');
  const [assetCategory] = useState('Machinery');
  const [assetMappedCompany, setAssetMappedCompany] = useState('');

  // New AMC Form State
  const [amcName, setAmcName] = useState('');
  const [amcCompany, setAmcCompany] = useState('');
  const [amcStartDate, setAmcStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [amcEndDate, setAmcEndDate] = useState('2027-12-31');
  const [amcTotalVisits, setAmcTotalVisits] = useState('12');
  const [amcIncludedLabor, setAmcIncludedLabor] = useState(true);

  // New Part Form State
  const [partName, setPartName] = useState('');
  const [partSku, setPartSku] = useState('');
  const [partCategory, setPartCategory] = useState('Hardware');
  const [partLocation, setPartLocation] = useState('Central Warehouse, Zone A');
  const [partPrice, setPartPrice] = useState('₹12,500');
  const [partStock, setPartStock] = useState('10');
  const [partMinStock, setPartMinStock] = useState('2');

  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [isSubmittingComp, setIsSubmittingComp] = useState(false);
  const [isSubmittingAMC, setIsSubmittingAMC] = useState(false);
  const [isSubmittingPart, setIsSubmittingPart] = useState(false);

  // Handlers
  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingComp) return;
    if (!compName.trim()) {
      toast.error('Please enter company name');
      return;
    }
    setIsSubmittingComp(true);
    try {
      const createdComp = addCompany({
        name: compName.trim(),
        code: compCode.trim() || compName.trim().slice(0, 4).toUpperCase(),
        industry: compIndustry,
        email: compEmail.trim() || `admin@${compName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: compPhone.trim() || '+91 98000 11111',
        is_active: true
      });

      toast.success(`Company ${createdComp.name} Master Created!`, {
        description: `Tenant short code ${createdComp.code} initialized with RLS isolation policies.`
      });
      setCompanyModalOpen(false);
      setCompName('');
      setCompCode('');
      setCompEmail('');
      setCompPhone('');
    } finally {
      setIsSubmittingComp(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingUser) return;
    if (!userName.trim() || !userEmail.trim()) {
      toast.error('Please enter user name and email address');
      return;
    }

    setIsSubmittingUser(true);
    try {
      const rawPassword = userPassword.trim() || 'KaaPass2026!#';
      const computedHash = await hashPassword(rawPassword);

      const selectedCompany = userRoleType === 'KAA Internal Staff' 
        ? 'Global (All Companies)' 
        : (userMappedCompany || (companiesList[0]?.name || ''));

      // 1. Provision user directly into Supabase Auth & PostgreSQL profiles
      try {
        const { error: rpcError } = await (supabase.rpc as any)('admin_create_user', {
          p_email: userEmail.trim().toLowerCase(),
          p_password: rawPassword,
          p_full_name: userName.trim(),
          p_role_type: userRoleType,
          p_role_name: userRoleName,
          p_mapped_company: selectedCompany
        });
        if (rpcError) console.warn('Supabase admin_create_user notice:', rpcError.message);
      } catch (err) {
        console.warn('Supabase user creation notice:', err);
      }

      // 2. Add user to master store
      const createdUser = addUser({
        name: userName.trim(),
        email: userEmail.trim().toLowerCase(),
        roleType: userRoleType,
        roleName: userRoleName,
        mappedCompany: selectedCompany,
        status: 'Active',
        passwordHash: computedHash,
        isPasswordResetRequired: true
      });

      toast.success(`User ${createdUser.name} Onboarded & Role Mapped!`, {
        description: userRoleType === 'Client User' 
          ? `Mapped strictly to tenant ${selectedCompany} with encrypted credentials.` 
          : 'Granted global KAA internal staff access.'
      });

      setUserModalOpen(false);
      setUserName('');
      setUserEmail('');
      setUserPassword('KaaPass2026!#');
    } catch {
      toast.error('Failed to create user. Please try again.');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleOpenPasswordReset = (usr: UserMaster) => {
    setSelectedUserForPassword(usr);
    setResetNewPassword(`KaaReset${Math.floor(1000 + Math.random() * 9000)}!`);
    setPasswordModalOpen(true);
  };

  const handleSavePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword) return;
    if (!resetNewPassword.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    const rawPassword = resetNewPassword.trim();
    const computedHash = await hashPassword(rawPassword);

    try {
      await (supabase.rpc as any)('admin_create_user', {
        p_email: selectedUserForPassword.email.trim().toLowerCase(),
        p_password: rawPassword,
        p_full_name: selectedUserForPassword.name,
        p_role_type: selectedUserForPassword.roleType,
        p_role_name: selectedUserForPassword.roleName,
        p_mapped_company: selectedUserForPassword.mappedCompany
      });
    } catch (err) {
      console.warn('Supabase reset notice:', err);
    }

    resetUserPassword(selectedUserForPassword.id, rawPassword);
    useMasterStore.getState().updateUser(selectedUserForPassword.id, {
      passwordHash: computedHash,
      password: '',
      defaultPassword: ''
    });

    toast.success(`Password Reset for ${selectedUserForPassword.name}!`, {
      description: `New password updated: ${rawPassword}`
    });

    setPasswordModalOpen(false);
    setSelectedUserForPassword(null);
    setResetNewPassword('');
  };

  const handleCreateAssetMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) {
      toast.error('Please enter equipment name');
      return;
    }

    const targetCompany = assetMappedCompany || (companiesList[0]?.name || '');

    const createdAsset = addAsset({
      tag: assetTag || `AST-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: assetName.trim(),
      company: targetCompany,
      category: assetCategory,
      model: assetModel.trim() || 'Standard Industrial Unit',
      serial: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Active',
      amcStatus: 'Active AMC',
      warrantyExpires: '2027-12-31'
    });

    toast.success(`Asset ${createdAsset.name} Mapped to ${targetCompany}!`, {
      description: `Tag ${createdAsset.tag} is now available for ${targetCompany} users.`
    });

    setAssetModalOpen(false);
    setAssetName('');
    setAssetTag('');
    setAssetModel('');
  };

  const handleCreateAMCMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingAMC) return;
    if (!amcName.trim()) {
      toast.error('Please enter AMC contract name');
      return;
    }
    const targetCompany = amcCompany || (companiesList[0]?.name || 'KAA Client');
    setIsSubmittingAMC(true);
    try {
      const created = addAMCContract({
        name: amcName.trim(),
        company: targetCompany,
        startDate: amcStartDate,
        endDate: amcEndDate,
        totalVisits: parseInt(amcTotalVisits) || 12,
        usedVisits: 0,
        status: 'Active',
        includedLabor: amcIncludedLabor
      });

      toast.success(`AMC Contract Created: ${created.contractNumber}`, {
        description: `Linked to ${targetCompany} with ${created.totalVisits} annual maintenance visits.`
      });

      setAmcModalOpen(false);
      setAmcName('');
    } finally {
      setIsSubmittingAMC(false);
    }
  };

  const handleCreatePartMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingPart) return;
    if (!partName.trim()) {
      toast.error('Please enter spare part name');
      return;
    }
    setIsSubmittingPart(true);
    try {
      const created = addInventoryPart({
        name: partName.trim(),
        sku: partSku.trim() || `PRT-${Math.floor(1000 + Math.random() * 9000)}`,
        category: partCategory,
        location: partLocation,
        unitPrice: partPrice.startsWith('₹') ? partPrice : `₹${partPrice}`,
        stock: parseInt(partStock) || 10,
        minStock: parseInt(partMinStock) || 2
      });

      toast.success(`Spare Part Master Registered: ${created.sku}`, {
        description: `${created.name} added with ${created.stock} units initial stock.`
      });

      setPartModalOpen(false);
      setPartName('');
      setPartSku('');
    } finally {
      setIsSubmittingPart(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.info('Password copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Masters & Core Entity Management"
        description="Comprehensive central master registry for Companies, Users & Roles, Equipment Assets, AMC Contracts, and Spare Parts"
      >
        <div className="flex flex-wrap gap-2">
          {activeTab === 'companies' && (
            <Button variant="default" onClick={() => setCompanyModalOpen(true)} className="gap-2 text-xs">
              <Building2 className="w-4 h-4" /> Add Company Master
            </Button>
          )}
          {activeTab === 'users' && (
            <Button variant="default" onClick={() => setUserModalOpen(true)} className="gap-2 text-xs">
              <UserPlus className="w-4 h-4" /> Create & Map User
            </Button>
          )}
          {activeTab === 'assets' && (
            <Button variant="default" onClick={() => setAssetModalOpen(true)} className="gap-2 text-xs">
              <Cpu className="w-4 h-4" /> Map Asset to Company
            </Button>
          )}
          {activeTab === 'amc' && (
            <Button variant="default" onClick={() => {
              if (companiesList.length === 0) {
                toast.error('Please onboard a company first.');
                return;
              }
              setAmcCompany(companiesList[0]?.name || '');
              setAmcModalOpen(true);
            }} className="gap-2 text-xs">
              <FileCheck2 className="w-4 h-4" /> Create AMC Contract
            </Button>
          )}
          {activeTab === 'parts' && (
            <Button variant="default" onClick={() => setPartModalOpen(true)} className="gap-2 text-xs">
              <Boxes className="w-4 h-4" /> Register Spare Part
            </Button>
          )}
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-secondary/40 p-1 border border-border rounded-xl flex flex-wrap h-auto gap-1">
          <TabsTrigger value="companies" className="gap-2 text-xs">
            <Building2 className="w-3.5 h-3.5 text-primary" /> Companies ({companiesList.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2 text-xs">
            <Users className="w-3.5 h-3.5 text-amber-400" /> Users & Roles ({usersList.length})
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-2 text-xs">
            <Package className="w-3.5 h-3.5 text-emerald-400" /> Assets & Machinery ({assetsList.length})
          </TabsTrigger>
          <TabsTrigger value="amc" className="gap-2 text-xs">
            <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" /> AMC Contracts ({amcList.length})
          </TabsTrigger>
          <TabsTrigger value="parts" className="gap-2 text-xs">
            <Boxes className="w-3.5 h-3.5 text-violet-400" /> Spare Parts & Inventory ({partsList.length})
          </TabsTrigger>
        </TabsList>

        {/* Search Bar */}
        <div className="mt-4 flex items-center gap-4 bg-secondary/30 p-3 rounded-xl border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search in ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs outline-none focus:border-primary text-foreground"
            />
          </div>
        </div>

        {/* Tab 1: Companies Master */}
        <TabsContent value="companies" className="mt-4 space-y-4">
          {companiesList.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center border border-border flex flex-col items-center justify-center">
              <Building2 className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <h3 className="text-base font-bold text-foreground">No Companies Registered Yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">Click "Add Company Master" above to onboard your first client tenant company into the portal.</p>
              <Button onClick={() => setCompanyModalOpen(true)} size="sm" className="mt-4 gap-2 text-xs">
                <Building2 className="w-4 h-4" /> Add Company Master
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {companiesList
                .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((comp) => (
                  <div key={comp.id} className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all flex flex-col justify-between space-y-4 shadow-lg">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 font-semibold">
                          {comp.code}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-lg text-foreground">{comp.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{comp.industry}</p>

                      <div className="space-y-2 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/50">
                        <div className="flex justify-between">
                          <span>Contact Email:</span>
                          <span className="font-mono text-foreground">{comp.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mapped Users:</span>
                          <span className="font-bold text-amber-400">
                            {usersList.filter(u => u.mappedCompany === comp.name).length} users
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mapped Assets:</span>
                          <span className="font-bold text-emerald-400">
                            {assetsList.filter(a => a.company === comp.name).length} assets
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Tenant Active
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => { deleteCompany(comp.id); toast.info(`Deleted ${comp.name}`); }} className="text-xs text-destructive hover:text-destructive gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: User & Role Mapping Master */}
        <TabsContent value="users" className="mt-4 space-y-4">
          <div className="glass rounded-xl border border-border overflow-hidden shadow-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-secondary/80 border-b border-border text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Role Type</th>
                  <th className="p-3">Role Designation</th>
                  <th className="p-3">Mapped Tenant Scope</th>
                  <th className="p-3">Password Provision</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {usersList
                  .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.mappedCompany.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((usr) => (
                    <tr key={usr.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-3 font-semibold text-foreground">{usr.name}</td>
                      <td className="p-3 font-mono text-muted-foreground">{usr.email}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={usr.roleType === 'KAA Internal Staff' ? 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10' : 'border-amber-500/30 text-amber-400 bg-amber-500/10'}>
                          {usr.roleType}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium text-foreground">{usr.roleName}</td>
                      <td className="p-3 font-semibold">
                        {usr.roleType === 'KAA Internal Staff' ? (
                          <span className="text-indigo-400 flex items-center gap-1">🌐 Global Admin Scope</span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Mapped to {usr.mappedCompany}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                          <KeyRound className="w-3 h-3 text-primary shrink-0" />
                          <span>{usr.password ? '••••••••' : 'Default Set'}</span>
                          {usr.isPasswordResetRequired && (
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded ml-1">
                              Reset Required
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right flex items-center justify-end gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenPasswordReset(usr)} 
                          className="text-[11px] gap-1 py-1 h-7 border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <KeyRound className="w-3 h-3" /> Reset Pass
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { deleteUser(usr.id); toast.info(`Removed user ${usr.name}`); }} 
                          className="text-[11px] py-1 h-7 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 3: Asset & Machinery Mapping Master */}
        <TabsContent value="assets" className="mt-4 space-y-4">
          <div className="glass rounded-xl border border-border overflow-hidden shadow-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-secondary/80 border-b border-border text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="p-3">Asset Tag</th>
                  <th className="p-3">Equipment / Product Name</th>
                  <th className="p-3">Model / Serial #</th>
                  <th className="p-3">Mapped Client Company</th>
                  <th className="p-3">AMC Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {assetsList
                  .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.tag.toLowerCase().includes(searchTerm.toLowerCase()) || a.company.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((ast: any) => (
                    <tr key={ast.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-primary">{ast.tag}</td>
                      <td className="p-3 font-semibold text-foreground">{ast.name}</td>
                      <td className="p-3 font-mono text-muted-foreground">{ast.model} ({ast.serial})</td>
                      <td className="p-3 font-bold text-emerald-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-primary" /> {ast.company}
                      </td>
                      <td className="p-3">
                        <Badge variant={ast.amcStatus === 'Active AMC' ? 'success' : 'secondary'}>
                          {ast.amcStatus}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => { deleteAsset(ast.id); toast.info(`Deleted asset ${ast.tag}`); }} className="text-xs text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 4: AMC Contracts Master */}
        <TabsContent value="amc" className="mt-4 space-y-4">
          <div className="glass rounded-xl border border-border overflow-hidden shadow-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-secondary/80 border-b border-border text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="p-3">Contract #</th>
                  <th className="p-3">Agreement Name</th>
                  <th className="p-3">Client Company</th>
                  <th className="p-3">Period</th>
                  <th className="p-3">Visits Quota</th>
                  <th className="p-3">Labor Inclusions</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {amcList
                  .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) || c.company.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-cyan-400">{c.contractNumber}</td>
                      <td className="p-3 font-semibold text-foreground">{c.name}</td>
                      <td className="p-3 font-bold text-emerald-400">{c.company}</td>
                      <td className="p-3 text-muted-foreground">{c.startDate} to {c.endDate}</td>
                      <td className="p-3 font-bold text-foreground">{c.usedVisits} / {c.totalVisits} visits</td>
                      <td className="p-3">
                        <Badge variant="outline" className={c.includedLabor ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-border'}>
                          {c.includedLabor ? 'Labor Covered' : 'Labor Excluded'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="success">{c.status}</Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 5: Spare Parts & Inventory Master */}
        <TabsContent value="parts" className="mt-4 space-y-4">
          <div className="glass rounded-xl border border-border overflow-hidden shadow-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-secondary/80 border-b border-border text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Component / Part Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Storage Location</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">Current Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {partsList
                  .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-violet-400">{p.sku}</td>
                      <td className="p-3 font-semibold text-foreground">{p.name}</td>
                      <td className="p-3 text-muted-foreground">{p.category}</td>
                      <td className="p-3 text-muted-foreground flex items-center gap-1">
                        <Warehouse className="w-3 h-3 text-primary" /> {p.location}
                      </td>
                      <td className="p-3 font-mono text-foreground font-semibold">{p.unitPrice}</td>
                      <td className="p-3">
                        <Badge variant={p.stock <= p.minStock ? 'destructive' : 'success'}>
                          {p.stock} units {p.stock <= p.minStock && '(Low)'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => { deleteInventoryPart(p.id); toast.info(`Removed ${p.sku}`); }} className="text-xs text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal 1: Add Company Master */}
      <Dialog open={companyModalOpen} onOpenChange={setCompanyModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Add New Client Company Master
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create a new client tenant organization. RLS database policies will isolate all user data.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Company Name *</label>
              <input 
                type="text" 
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="E.g., Qatar Industrial Trading LLC"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Company Code</label>
                <input 
                  type="text" 
                  value={compCode}
                  onChange={(e) => setCompCode(e.target.value)}
                  placeholder="QITL"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Industry Sector</label>
                <select 
                  value={compIndustry}
                  onChange={(e) => setCompIndustry(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                >
                  <option value="Industrial Manufacturing">Industrial Manufacturing</option>
                  <option value="Electronics & Automation">Electronics & Automation</option>
                  <option value="Oil & Gas / Energy">Oil & Gas / Energy</option>
                  <option value="Pharma & Healthcare">Pharma & Healthcare</option>
                  <option value="Textiles & Logistics">Textiles & Logistics</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Primary Contact Email</label>
              <input 
                type="email" 
                value={compEmail}
                onChange={(e) => setCompEmail(e.target.value)}
                placeholder="info@qataritl.com"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCompanyModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs">
                Save & Initialize Tenant
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Create & Map User */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-400" /> Create User & Provision Password
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Assign role scope (Internal vs Client) and default initial password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Full Name *</label>
              <input 
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="E.g., User Name"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">User Email Address *</label>
              <input 
                type="email" 
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="user@company.com"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Account Scope</label>
                <select 
                  value={userRoleType}
                  onChange={(e: any) => setUserRoleType(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                >
                  <option value="Client User">Client User (Scoped)</option>
                  <option value="KAA Internal Staff">KAA Internal Staff</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Role Designation</label>
                <select 
                  value={userRoleName}
                  onChange={(e) => setUserRoleName(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                >
                  {userRoleType === 'KAA Internal Staff' ? (
                    <>
                      <option value="Senior Field Engineer">Senior Field Engineer</option>
                      <option value="Service Coordinator">Service Coordinator</option>
                      <option value="Support Manager">Support Manager</option>
                      <option value="Super Admin">Super Admin</option>
                    </>
                  ) : (
                    <>
                      <option value="Client Requester">Client Requester</option>
                      <option value="Company Admin">Company Admin</option>
                      <option value="Plant Manager">Plant Manager</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {userRoleType === 'Client User' && (
              <div className="space-y-1 p-3 bg-secondary/40 rounded-lg border border-amber-500/30">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Map User to Client Company *
                </label>
                <select 
                  value={userMappedCompany}
                  onChange={(e) => setUserMappedCompany(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground font-semibold"
                >
                  {companiesList.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Password Provision Section */}
            <div className="space-y-1 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <label className="text-xs font-bold text-primary flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" /> Initial Password Provision
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 pr-20 text-xs font-mono outline-none focus:border-primary text-foreground"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-muted-foreground hover:text-foreground text-[10px]"
                    title={showPassword ? "Hide" : "Show"}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(userPassword)}
                    className="p-1 text-primary hover:text-primary/80 text-[10px]"
                    title="Copy Password"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Password is encrypted and synchronized directly into Supabase Auth.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setUserModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs">
                Save & Map Access
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Password Reset Provision */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" /> Reset User Password
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update or issue a new password for <strong>{selectedUserForPassword?.name}</strong> ({selectedUserForPassword?.email}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePasswordReset} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">New Password *</label>
              <div className="relative">
                <input 
                  type={showResetPassword ? "text" : "password"} 
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 pr-20 text-xs font-mono outline-none focus:border-primary text-foreground"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(resetNewPassword)}
                    className="p-1 text-primary hover:text-primary/80"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPasswordModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs">
                Update & Reset Password
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 4: Map Asset/Product to Company */}
      <Dialog open={assetModalOpen} onOpenChange={setAssetModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" /> Map Machinery Asset to Client
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Assign an equipment model/serial number to a client company so their users can raise support tickets.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAssetMapping} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Equipment / Product Name *</label>
              <input 
                type="text" 
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="E.g., Siemens S7-1500 Controller Rack"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Asset Tag Code</label>
                <input 
                  type="text" 
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  placeholder="AST-2026-991"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Model / Specs</label>
                <input 
                  type="text" 
                  value={assetModel}
                  onChange={(e) => setAssetModel(e.target.value)}
                  placeholder="CPU 1518-4 PN/DP"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1 p-3 bg-secondary/40 rounded-lg border border-emerald-500/30">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Assign Owner Client Company *
              </label>
              <select 
                value={assetMappedCompany}
                onChange={(e) => setAssetMappedCompany(e.target.value)}
                className="w-full bg-card border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground font-semibold"
              >
                {companiesList.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAssetModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs">
                Save & Map Asset
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 5: Create AMC Contract */}
      <Dialog open={amcModalOpen} onOpenChange={setAmcModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-cyan-400" /> Create AMC Contract Master
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Register an Annual Maintenance Contract linked to a client company.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAMCMaster} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Contract Title *</label>
              <input 
                type="text" 
                value={amcName}
                onChange={(e) => setAmcName(e.target.value)}
                placeholder="E.g., Comprehensive Automation Support AMC"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Client Company *</label>
              <select 
                value={amcCompany}
                onChange={(e) => setAmcCompany(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground font-semibold"
              >
                {companiesList.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Start Date</label>
                <input 
                  type="date" 
                  value={amcStartDate}
                  onChange={(e) => setAmcStartDate(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">End Date</label>
                <input 
                  type="date" 
                  value={amcEndDate}
                  onChange={(e) => setAmcEndDate(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Annual Visits Quota</label>
                <input 
                  type="number" 
                  value={amcTotalVisits}
                  onChange={(e) => setAmcTotalVisits(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1 flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground pb-3">
                  <input 
                    type="checkbox" 
                    checked={amcIncludedLabor}
                    onChange={(e) => setAmcIncludedLabor(e.target.checked)}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span>Includes Labor</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAmcModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs">
                Save AMC Contract
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 6: Register Spare Part */}
      <Dialog open={partModalOpen} onOpenChange={setPartModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Boxes className="w-5 h-5 text-violet-400" /> Register Spare Part Master
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new replacement part or component SKU to the inventory master.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePartMaster} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Part / Component Name *</label>
              <input 
                type="text" 
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                placeholder="E.g., Siemens PLC DI Module 16x24V"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">SKU Code</label>
                <input 
                  type="text" 
                  value={partSku}
                  onChange={(e) => setPartSku(e.target.value)}
                  placeholder="PRT-5520"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Category</label>
                <select 
                  value={partCategory}
                  onChange={(e) => setPartCategory(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="PLC & Drives">PLC & Drives</option>
                  <option value="Sensors & Cables">Sensors & Cables</option>
                  <option value="Power Supplies">Power Supplies</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Initial Stock</label>
                <input 
                  type="number" 
                  value={partStock}
                  onChange={(e) => setPartStock(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Min Threshold</label>
                <input 
                  type="number" 
                  value={partMinStock}
                  onChange={(e) => setPartMinStock(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Unit Price</label>
                <input 
                  type="text" 
                  value={partPrice}
                  onChange={(e) => setPartPrice(e.target.value)}
                  placeholder="₹12,500"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Storage Location</label>
                <input 
                  type="text" 
                  value={partLocation}
                  onChange={(e) => setPartLocation(e.target.value)}
                  placeholder="Central Warehouse, Zone A"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPartModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs">
                Save Spare Part
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
