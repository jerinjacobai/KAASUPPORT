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
  FileSpreadsheet,
  Layers,
  Pencil
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMasterStore, type UserMaster } from '@/stores/master-store';
import { hashPassword } from '@/lib/crypto';
import { supabase } from '@/lib/supabase';
import { AssetExcelImportModal } from '@/features/assets/AssetExcelImportModal';
import { EditAssetModal } from '@/features/assets/EditAssetModal';

export default function MastersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'companies');
  const [searchTerm, setSearchTerm] = useState('');

  const [editAssetModalOpen, setEditAssetModalOpen] = useState(false);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState<any>(null);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Master Store State
  const { 
    companies: companiesList, 
    users: usersList, 
    assets: assetsList, 
    amcContracts: amcList,
    hardwareTypes: hardwareTypesList,
    addCompany, 
    deleteCompany,
    addUser, 
    resetUserPassword,
    deleteUser,
    addAsset, 
    deleteAsset,
    addAMCContract,
    addHardwareType,
    deleteHardwareType
  } = useMasterStore();
  const activeCompaniesList = companiesList.filter(company => company.is_active);

  // Modals state
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [amcModalOpen, setAmcModalOpen] = useState(false);
  const [excelImportModalOpen, setExcelImportModalOpen] = useState(false);
  const [hwModalOpen, setHwModalOpen] = useState(false);

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

  // New Hardware Type State
  const [hwName, setHwName] = useState('');
  const [hwCode, setHwCode] = useState('');
  const [hwDescription, setHwDescription] = useState('');
  const [isSubmittingHw, setIsSubmittingHw] = useState(false);

  // New Asset Form State
  const [assetName, setAssetName] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [assetModel, setAssetModel] = useState('');
  const [assetCategory] = useState('Machinery');
  const [assetMappedCompany, setAssetMappedCompany] = useState('');
  const [assetUser, setAssetUser] = useState('');
  const [hardwareType, setHardwareType] = useState('PLC');
  const [isCustomHardwareType, setIsCustomHardwareType] = useState(false);
  const [customHardwareType, setCustomHardwareType] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [assetRemarks, setAssetRemarks] = useState('');
  const [assetSuggestion, setAssetSuggestion] = useState('');
  const [provisionFile, setProvisionFile] = useState<File | null>(null);
  const [savingAsset, setSavingAsset] = useState(false);

  // New AMC Form State
  const [amcName, setAmcName] = useState('');
  const [amcCompany, setAmcCompany] = useState('');
  const [amcStartDate, setAmcStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [amcEndDate, setAmcEndDate] = useState('2027-12-31');
  const [amcTotalVisits, setAmcTotalVisits] = useState('12');
  const [amcIncludedLabor, setAmcIncludedLabor] = useState(true);

  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [isSubmittingComp, setIsSubmittingComp] = useState(false);
  const [isSubmittingAMC, setIsSubmittingAMC] = useState(false);

  // Handlers
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingComp) return;
    if (!compName.trim()) {
      toast.error('Please enter company name');
      return;
    }
    setIsSubmittingComp(true);
    try {
      const createdComp = await addCompany({
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
    } catch (error) {
      toast.error('Failed to create company', { description: error instanceof Error ? error.message : 'Please try again.' });
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
        : (userMappedCompany || (activeCompaniesList[0]?.name || ''));

      const createdUser = await addUser({
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
    } catch (error) {
      toast.error('Failed to create user', {
        description: error instanceof Error ? error.message : 'Please try again.'
      });
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
      await resetUserPassword(selectedUserForPassword.id, rawPassword);
      useMasterStore.getState().updateUser(selectedUserForPassword.id, {
        passwordHash: computedHash,
        password: '',
        defaultPassword: ''
      });
    } catch (error) {
      toast.error('Failed to reset password', {
        description: error instanceof Error ? error.message : 'Please try again.'
      });
      return;
    }

    toast.success(`Password Reset for ${selectedUserForPassword.name}!`, {
      description: `New password updated: ${rawPassword}`
    });

    setPasswordModalOpen(false);
    setSelectedUserForPassword(null);
    setResetNewPassword('');
  };

  const handleCreateHardwareType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingHw) return;
    if (!hwName.trim()) {
      toast.error('Please enter hardware type name');
      return;
    }
    setIsSubmittingHw(true);
    try {
      const created = await addHardwareType({
        name: hwName.trim(),
        code: hwCode.trim() || hwName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 10),
        description: hwDescription.trim() || `${hwName.trim()} Industrial Hardware`
      });
      toast.success(`Hardware Type '${created.name}' registered!`);
      setHwModalOpen(false);
      setHwName('');
      setHwCode('');
      setHwDescription('');
    } catch (error) {
      toast.error('Failed to create hardware type', {
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    } finally {
      setIsSubmittingHw(false);
    }
  };

  const handleDeleteHardwareType = async (hw: typeof hardwareTypesList[number]) => {
    try {
      await deleteHardwareType(hw.id);
      toast.success(`Hardware type '${hw.name}' removed`);
    } catch (error) {
      toast.error('Failed to remove hardware type', {
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    }
  };

  const handleCreateAssetMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) {
      toast.error('Please enter equipment name');
      return;
    }

    const targetCompany = assetMappedCompany || (activeCompaniesList[0]?.name || '');
    const selectedHwType = isCustomHardwareType ? customHardwareType.trim() : hardwareType;

    setSavingAsset(true);
    let provisionPath = '';
    try {
      if (provisionFile) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('Please sign in again before uploading a provision.');
        const safeName = provisionFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        provisionPath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
        const { error } = await supabase.storage.from('asset-provisions').upload(provisionPath, provisionFile);
        if (error) throw new Error(`Provision upload failed: ${error.message}`);
      }
      const createdAsset = await addAsset({
        tag: assetTag || `AST-2026-${Math.floor(100 + Math.random() * 900)}`,
        name: assetName.trim(),
        company: targetCompany,
        category: selectedHwType || assetCategory,
        model: assetModel.trim() || 'Standard Industrial Unit',
        serial: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'Active',
        amcStatus: 'Active AMC',
        warrantyExpires: '2027-12-31',
        assetUser: assetUser.trim(),
        hardwareType: selectedHwType || 'PLC',
        description: assetDescription.trim(),
        remarks: assetRemarks.trim(),
        suggestion: assetSuggestion.trim(),
        provisionPath
      });

      toast.success(`Asset ${createdAsset.name} Mapped to ${targetCompany}!`, {
        description: `Tag ${createdAsset.tag} is now available for ${targetCompany} users.`
      });

      setAssetModalOpen(false);
      setAssetName('');
      setAssetTag('');
      setAssetModel('');
      setAssetUser('');
      setHardwareType('PLC');
      setIsCustomHardwareType(false);
      setCustomHardwareType('');
      setAssetDescription('');
      setAssetRemarks('');
      setAssetSuggestion('');
      setProvisionFile(null);
    } catch (error) {
      if (provisionPath) await supabase.storage.from('asset-provisions').remove([provisionPath]);
      toast.error(error instanceof Error ? error.message : 'Could not save asset.');
    } finally {
      setSavingAsset(false);
    }
  };

  const handleCreateAMCMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingAMC) return;
    if (!amcName.trim()) {
      toast.error('Please enter AMC contract name');
      return;
    }
    const targetCompany = amcCompany || (activeCompaniesList[0]?.name || 'KAA Client');
    setIsSubmittingAMC(true);
    try {
      const created = await addAMCContract({
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
    } catch (error) {
      toast.error('Failed to create AMC contract', { description: error instanceof Error ? error.message : 'Please try again.' });
    } finally {
      setIsSubmittingAMC(false);
    }
  };

  const handleDeactivateCompany = async (company: typeof companiesList[number]) => {
    try {
      await deleteCompany(company.id);
      toast.success(`${company.name} deactivated`, { description: 'Existing tickets and assets were kept.' });
    } catch (error) {
      toast.error('Could not deactivate company', { description: error instanceof Error ? error.message : 'Please try again.' });
    }
  };

  const handleDeactivateUser = async (user: UserMaster) => {
    try {
      await deleteUser(user.id);
      toast.success(`${user.name} deactivated`);
    } catch (error) {
      toast.error('Could not deactivate user', { description: error instanceof Error ? error.message : 'Please try again.' });
    }
  };

  const handleDeleteAsset = async (asset: typeof assetsList[number]) => {
    try {
      await deleteAsset(asset.id);
      toast.success(`Deleted asset ${asset.tag}`);
    } catch (error) {
      toast.error('Could not delete asset', { description: error instanceof Error ? error.message : 'Please try again.' });
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
        description="Comprehensive central master registry for Companies, Users & Roles, Hardware Types, Equipment Assets, and AMC Contracts"
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
          {activeTab === 'hardwareTypes' && (
            <Button variant="default" onClick={() => setHwModalOpen(true)} className="gap-2 text-xs">
              <Layers className="w-4 h-4" /> Add Hardware Type
            </Button>
          )}
          {activeTab === 'assets' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setExcelImportModalOpen(true)} className="gap-2 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Import Excel
              </Button>
              <Button variant="default" onClick={() => setAssetModalOpen(true)} className="gap-2 text-xs">
                <Cpu className="w-4 h-4" /> Map Asset to Company
              </Button>
            </div>
          )}
          {activeTab === 'amc' && (
            <Button variant="default" onClick={() => {
              if (companiesList.length === 0) {
                toast.error('Please onboard a company first.');
                return;
              }
              setAmcCompany(activeCompaniesList[0]?.name || '');
              setAmcModalOpen(true);
            }} className="gap-2 text-xs">
              <FileCheck2 className="w-4 h-4" /> Create AMC Contract
            </Button>
          )}
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-secondary/40 p-1 border border-border rounded-xl flex flex-wrap h-auto gap-1">
          <TabsTrigger value="companies" className="gap-2 text-xs">
            <Building2 className="w-3.5 h-3.5 text-primary" /> Companies ({companiesList.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2 text-xs">
            <Users className="w-3.5 h-3.5 text-amber-400" /> Users & Roles ({usersList.length})
          </TabsTrigger>
          <TabsTrigger value="hardwareTypes" className="gap-2 text-xs">
            <Layers className="w-3.5 h-3.5 text-purple-400" /> Hardware Types ({hardwareTypesList.length})
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-2 text-xs">
            <Package className="w-3.5 h-3.5 text-emerald-400" /> Assets & Machinery ({assetsList.length})
          </TabsTrigger>
          <TabsTrigger value="amc" className="gap-2 text-xs">
            <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" /> AMC Contracts ({amcList.length})
          </TabsTrigger>
        </TabsList>

        {/* Search Bar */}
        <div className="mt-4 flex items-center gap-4 bg-secondary/30 p-3 rounded-xl border border-border">
          <div className="relative flex-1">
            <label htmlFor="masters-search" className="sr-only">Search in {activeTab}</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="masters-search"
              name="masters-search"
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
                      <span className={`text-[11px] font-semibold flex items-center gap-1 ${comp.is_active ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> {comp.is_active ? 'Tenant Active' : 'Tenant Inactive'}
                      </span>
                      <Button variant="ghost" size="sm" disabled={!comp.is_active} onClick={() => void handleDeactivateCompany(comp)} className="text-xs text-destructive hover:text-destructive gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Deactivate
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
                          disabled={usr.status === 'Inactive'}
                          onClick={() => void handleDeactivateUser(usr)}
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

        {/* Tab: Hardware Types Master */}
        <TabsContent value="hardwareTypes" className="mt-4 space-y-4">
          <div className="flex justify-between items-center bg-secondary/20 p-4 rounded-xl border border-border">
            <div>
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" /> Industrial Hardware Types Registry
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Standard hardware categories (e.g. PLC, VFD, HMI, Sensors, Robots) selectable during asset mapping and Excel import.
              </p>
            </div>
            <Button size="sm" onClick={() => setHwModalOpen(true)} className="gap-2 text-xs">
              <Layers className="w-4 h-4" /> Add Hardware Type
            </Button>
          </div>

          <div className="glass rounded-xl border border-border overflow-hidden shadow-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-secondary/80 border-b border-border text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="p-3">Type Code</th>
                  <th className="p-3">Hardware Name</th>
                  <th className="p-3">Description / Industrial Classification</th>
                  <th className="p-3">Mapped Assets Count</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {hardwareTypesList
                  .filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()) || (h.code ? h.code.toLowerCase().includes(searchTerm.toLowerCase()) : false))
                  .map((hw) => {
                    const mappedCount = assetsList.filter(a => a.hardwareType === hw.name || a.category === hw.name).length;
                    return (
                      <tr key={hw.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-purple-400">{hw.code || 'HW'}</td>
                        <td className="p-3 font-semibold text-foreground">{hw.name}</td>
                        <td className="p-3 text-muted-foreground">{hw.description || 'Standard Industrial Hardware'}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="border-border text-foreground font-mono">
                            {mappedCount} assets
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => void handleDeleteHardwareType(hw)} 
                            className="text-xs text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                {hardwareTypesList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No hardware types registered yet. Click "Add Hardware Type" to add one.
                    </td>
                  </tr>
                )}
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
                  <th className="p-3">Hardware Type</th>
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
                      <td className="p-3">
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 font-medium">
                          {ast.hardwareType || ast.category || 'Equipment'}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">{ast.model} ({ast.serial})</td>
                      <td className="p-3 font-bold text-emerald-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-primary" /> {ast.company}
                      </td>
                      <td className="p-3">
                        <Badge variant={ast.amcStatus === 'Active AMC' ? 'success' : 'secondary'}>
                          {ast.amcStatus}
                        </Badge>
                      </td>
                      <td className="p-3 text-right flex items-center justify-end gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSelectedAssetForEdit(ast);
                            setEditAssetModalOpen(true);
                          }} 
                          className="text-xs gap-1 h-7 border-border hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => void handleDeleteAsset(ast)} className="text-xs text-destructive hover:bg-destructive/10">
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
              <label htmlFor="comp-name" className="text-xs font-medium text-foreground">Company Name *</label>
              <input 
                id="comp-name"
                name="companyName"
                type="text" 
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="E.g., Qatar Industrial Trading LLC"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="comp-code" className="text-xs font-medium text-foreground">Company Code</label>
                <input 
                  id="comp-code"
                  name="companyCode"
                  type="text" 
                  value={compCode}
                  onChange={(e) => setCompCode(e.target.value)}
                  placeholder="QITL"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="comp-industry" className="text-xs font-medium text-foreground">Industry Sector</label>
                <select 
                  id="comp-industry"
                  name="industry"
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="comp-email" className="text-xs font-medium text-foreground">Primary Contact Email</label>
                <input 
                  id="comp-email"
                  name="companyEmail"
                  type="email" 
                  value={compEmail}
                  onChange={(e) => setCompEmail(e.target.value)}
                  placeholder="info@qataritl.com"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="comp-phone" className="text-xs font-medium text-foreground">Phone Number</label>
                <input 
                  id="comp-phone"
                  name="companyPhone"
                  type="tel" 
                  value={compPhone}
                  onChange={(e) => setCompPhone(e.target.value)}
                  placeholder="+974 4400 1234"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>
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
              <label htmlFor="user-name" className="text-xs font-medium text-foreground">Full Name *</label>
              <input 
                id="user-name"
                name="userName"
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="E.g., User Name"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="user-email" className="text-xs font-medium text-foreground">User Email Address *</label>
              <input 
                id="user-email"
                name="userEmail"
                type="email" 
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="user@company.com"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="user-role-type" className="text-xs font-medium text-foreground">Account Scope</label>
                <select 
                  id="user-role-type"
                  name="userRoleType"
                  value={userRoleType}
                  onChange={(e: any) => setUserRoleType(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                >
                  <option value="Client User">Client User (Scoped)</option>
                  <option value="KAA Internal Staff">KAA Internal Staff</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="user-role-name" className="text-xs font-medium text-foreground">Role Designation</label>
                <select 
                  id="user-role-name"
                  name="userRoleName"
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
                <label htmlFor="user-mapped-company" className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Map User to Client Company *
                </label>
                <select 
                  id="user-mapped-company"
                  name="userMappedCompany"
                  value={userMappedCompany}
                  onChange={(e) => setUserMappedCompany(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground font-semibold"
                >
                  {activeCompaniesList.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Password Provision Section */}
            <div className="space-y-1 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <label htmlFor="user-password" className="text-xs font-bold text-primary flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" /> Initial Password Provision
              </label>
              <div className="relative">
                <input 
                  id="user-password"
                  name="userPassword"
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
              <label htmlFor="reset-new-password" className="text-xs font-medium text-foreground">New Password *</label>
              <div className="relative">
                <input 
                  id="reset-new-password"
                  name="resetNewPassword"
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
        <DialogContent className="max-w-lg bg-card border-border text-card-foreground p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" /> Add Asset to Client
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Register hardware, assign its user, and upload its provisioning document if available.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAssetMapping} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="master-asset-user" className="text-xs font-medium text-foreground">Asset User</label>
                <input 
                  id="master-asset-user"
                  name="assetUser"
                  type="text" 
                  value={assetUser} 
                  onChange={e => setAssetUser(e.target.value)} 
                  placeholder="User name" 
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground" 
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor={isCustomHardwareType ? "master-asset-hw-custom" : "master-asset-hw-type"} className="text-xs font-medium text-foreground">Hardware Type *</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomHardwareType(!isCustomHardwareType)}
                    className="text-[10px] text-primary hover:underline font-medium"
                  >
                    {isCustomHardwareType ? '← Choose from Master' : '+ Custom Type'}
                  </button>
                </div>
                {isCustomHardwareType ? (
                  <input
                    id="master-asset-hw-custom"
                    name="customHardwareType"
                    type="text"
                    value={customHardwareType}
                    onChange={e => setCustomHardwareType(e.target.value)}
                    placeholder="Enter custom hardware type..."
                    className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs text-foreground"
                  />
                ) : (
                  <select
                    id="master-asset-hw-type"
                    name="hardwareType"
                    value={hardwareType}
                    onChange={e => setHardwareType(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs text-foreground"
                  >
                    {hardwareTypesList.map(ht => (
                      <option key={ht.id} value={ht.name}>{ht.name}{ht.code ? ` (${ht.code})` : ''}</option>
                    ))}
                    {hardwareTypesList.length === 0 && (
                      <>
                        <option value="PLC">PLC</option>
                        <option value="VFD">VFD</option>
                        <option value="HMI">HMI</option>
                        <option value="Server">Server</option>
                        <option value="Laptops">Laptops</option>
                        <option value="Monitor">Monitor</option>
                      </>
                    )}
                  </select>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="master-asset-name" className="text-xs font-medium text-foreground">Asset Name *</label>
              <input 
                id="master-asset-name"
                name="assetName"
                type="text" 
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="E.g., Siemens S7-1500 Controller Rack"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="master-asset-description" className="text-xs font-medium text-foreground">Description</label>
              <textarea 
                id="master-asset-description"
                name="assetDescription"
                value={assetDescription} 
                onChange={e => setAssetDescription(e.target.value)} 
                rows={2} 
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs text-foreground" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="master-asset-remarks" className="text-xs font-medium text-foreground">Remarks</label>
                <textarea 
                  id="master-asset-remarks"
                  name="assetRemarks"
                  value={assetRemarks} 
                  onChange={e => setAssetRemarks(e.target.value)} 
                  rows={2} 
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs text-foreground" 
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="master-asset-suggestion" className="text-xs font-medium text-foreground">Suggestion</label>
                <textarea 
                  id="master-asset-suggestion"
                  name="assetSuggestion"
                  value={assetSuggestion} 
                  onChange={e => setAssetSuggestion(e.target.value)} 
                  rows={2} 
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs text-foreground" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="master-asset-provision-file" className="text-xs font-medium text-foreground">Provisioning Document</label>
              <input 
                id="master-asset-provision-file"
                name="provisionFile"
                type="file" 
                onChange={e => setProvisionFile(e.target.files?.[0] || null)} 
                className="w-full text-xs text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-xs" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="master-asset-tag" className="text-xs font-medium text-foreground">Asset Tag Code</label>
                <input 
                  id="master-asset-tag"
                  name="assetTag"
                  type="text" 
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  placeholder="AST-2026-991"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="master-asset-model" className="text-xs font-medium text-foreground">Model / Specs</label>
                <input 
                  id="master-asset-model"
                  name="assetModel"
                  type="text" 
                  value={assetModel}
                  onChange={(e) => setAssetModel(e.target.value)}
                  placeholder="CPU 1518-4 PN/DP"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1 p-3 bg-secondary/40 rounded-lg border border-emerald-500/30">
              <label htmlFor="master-asset-company" className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Assign Owner Client Company *
              </label>
              <select 
                id="master-asset-company"
                name="company"
                value={assetMappedCompany}
                onChange={(e) => setAssetMappedCompany(e.target.value)}
                className="w-full bg-card border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground font-semibold"
              >
                {activeCompaniesList.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAssetModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs" disabled={savingAsset}>
                {savingAsset ? 'Saving…' : 'Save Asset'}
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
              <label htmlFor="amc-name" className="text-xs font-medium text-foreground">Contract Title *</label>
              <input 
                id="amc-name"
                name="amcName"
                type="text" 
                value={amcName}
                onChange={(e) => setAmcName(e.target.value)}
                placeholder="E.g., Comprehensive Automation Support AMC"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="amc-company" className="text-xs font-medium text-foreground">Client Company *</label>
              <select 
                id="amc-company"
                name="amcCompany"
                value={amcCompany}
                onChange={(e) => setAmcCompany(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground font-semibold"
              >
                {activeCompaniesList.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="amc-start-date" className="text-xs font-medium text-foreground">Start Date</label>
                <input 
                  id="amc-start-date"
                  name="amcStartDate"
                  type="date" 
                  value={amcStartDate}
                  onChange={(e) => setAmcStartDate(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="amc-end-date" className="text-xs font-medium text-foreground">End Date</label>
                <input 
                  id="amc-end-date"
                  name="amcEndDate"
                  type="date" 
                  value={amcEndDate}
                  onChange={(e) => setAmcEndDate(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="amc-total-visits" className="text-xs font-medium text-foreground">Annual Visits Quota</label>
                <input 
                  id="amc-total-visits"
                  name="amcTotalVisits"
                  type="number" 
                  value={amcTotalVisits}
                  onChange={(e) => setAmcTotalVisits(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1 flex flex-col justify-end">
                <label htmlFor="amc-included-labor" className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground pb-3">
                  <input 
                    id="amc-included-labor"
                    name="amcIncludedLabor"
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

      {/* Modal: Add Hardware Type Master */}
      <Dialog open={hwModalOpen} onOpenChange={setHwModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" /> Add Industrial Hardware Type
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define a new category or hardware classification for automation equipment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateHardwareType} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="hw-name" className="text-xs font-medium text-foreground">Hardware Type Name *</label>
              <input 
                id="hw-name"
                name="hardwareTypeName"
                type="text" 
                value={hwName}
                onChange={(e) => setHwName(e.target.value)}
                placeholder="E.g., Programmable Logic Controller (PLC)"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="hw-code" className="text-xs font-medium text-foreground">Short Code</label>
              <input 
                id="hw-code"
                name="hardwareTypeCode"
                type="text" 
                value={hwCode}
                onChange={(e) => setHwCode(e.target.value)}
                placeholder="E.g., PLC"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary text-foreground uppercase"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="hw-description" className="text-xs font-medium text-foreground">Description / Notes</label>
              <textarea 
                id="hw-description"
                name="hardwareTypeDescription"
                value={hwDescription}
                onChange={(e) => setHwDescription(e.target.value)}
                rows={3}
                placeholder="E.g., Industrial digital computers for manufacturing and process control"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs text-foreground"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setHwModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs" disabled={isSubmittingHw}>
                {isSubmittingHw ? 'Saving…' : 'Register Hardware Type'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Asset Bulk Excel Import Modal */}
      <AssetExcelImportModal
        isOpen={excelImportModalOpen}
        onClose={() => setExcelImportModalOpen(false)}
      />

      {/* Edit Asset & Reassignment Modal */}
      <EditAssetModal
        open={editAssetModalOpen}
        onOpenChange={setEditAssetModalOpen}
        asset={selectedAssetForEdit}
      />
    </div>
  );
}
