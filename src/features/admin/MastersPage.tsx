import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Building2, Users, Package, Search, Lock, Edit3, CheckCircle2, UserPlus, Cpu } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { mockAssets } from '@/lib/mock-data';

// Mock Master Datasets
const initialCompanies = [
  { id: 'COMP-1', name: 'Acme Corp', code: 'ACME', industry: 'Manufacturing & Heavy Machinery', email: 'support@acmecorp.com', phone: '+91 98765 43210', assetsCount: 5, usersCount: 12, is_active: true },
  { id: 'COMP-2', name: 'Globex Ltd', code: 'GLBX', industry: 'Electronics & Automation', email: 'admin@globex.com', phone: '+91 98765 11223', assetsCount: 3, usersCount: 8, is_active: true },
  { id: 'COMP-3', name: 'Initech Inc', code: 'INTC', industry: 'Software & Cloud Infrastructure', email: 'it@initech.com', phone: '+91 98765 99887', assetsCount: 2, usersCount: 5, is_active: true },
];

const initialUsers = [
  { id: 'USR-1', name: 'Alex Johnson', email: 'alex.j@kaa.com', roleType: 'KAA Internal Staff', roleName: 'Senior Field Engineer', mappedCompany: 'Global (All Companies)', status: 'Active' },
  { id: 'USR-2', name: 'John Doe', email: 'john@acmecorp.com', roleType: 'Client User', roleName: 'Client Admin', mappedCompany: 'Acme Corp', status: 'Active' },
  { id: 'USR-3', name: 'Sarah Connor', email: 'sarah@globex.com', roleType: 'Client User', roleName: 'Department Manager', mappedCompany: 'Globex Ltd', status: 'Active' },
  { id: 'USR-4', name: 'Priya Sharma', email: 'priya.s@kaa.com', roleType: 'KAA Internal Staff', roleName: 'Service Coordinator', mappedCompany: 'Global (All Companies)', status: 'Active' },
];

export default function MastersPage() {
  const [activeTab, setActiveTab] = useState('companies');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [assetModalOpen, setAssetModalOpen] = useState(false);

  // Form states
  const [companiesList, setCompaniesList] = useState(initialCompanies);
  const [usersList, setUsersList] = useState(initialUsers);
  const [assetsList, setAssetsList] = useState(mockAssets);

  // New Company Form
  const [compName, setCompName] = useState('');
  const [compCode, setCompCode] = useState('');
  const [compIndustry, setCompIndustry] = useState('Industrial Manufacturing');
  const [compEmail, setCompEmail] = useState('');

  // New User Form
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRoleType, setUserRoleType] = useState<'KAA Internal Staff' | 'Client User'>('Client User');
  const [userMappedCompany, setUserMappedCompany] = useState('Acme Corp');

  // New Asset Form
  const [assetName, setAssetName] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [assetModel, setAssetModel] = useState('');
  const [assetMappedCompany, setAssetMappedCompany] = useState('Acme Corp');

  // Handlers
  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) {
      toast.error('Please enter company name');
      return;
    }
    const newComp = {
      id: `COMP-${companiesList.length + 1}`,
      name: compName,
      code: compCode || compName.slice(0, 4).toUpperCase(),
      industry: compIndustry,
      email: compEmail || `admin@${compName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: '+91 98000 11111',
      assetsCount: 0,
      usersCount: 0,
      is_active: true
    };
    setCompaniesList([newComp, ...companiesList]);
    toast.success(`Company ${compName} Master Created!`, {
      description: `Tenant short code ${newComp.code} initialized with RLS isolation policies.`
    });
    setCompanyModalOpen(false);
    setCompName('');
    setCompCode('');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      toast.error('Please enter user name and email');
      return;
    }
    const newUser = {
      id: `USR-${usersList.length + 1}`,
      name: userName,
      email: userEmail,
      roleType: userRoleType,
      roleName: userRoleType === 'KAA Internal Staff' ? 'Field Engineer' : 'Client Requester',
      mappedCompany: userRoleType === 'KAA Internal Staff' ? 'Global (All Companies)' : userMappedCompany,
      status: 'Active'
    };
    setUsersList([newUser, ...usersList]);
    toast.success(`User ${userName} Onboarded & Mapped!`, {
      description: userRoleType === 'Client User' 
        ? `Mapped strictly to tenant ${userMappedCompany}.` 
        : 'Granted global KAA internal staff access.'
    });
    setUserModalOpen(false);
    setUserName('');
    setUserEmail('');
  };

  const handleCreateAssetMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) {
      toast.error('Please enter asset name');
      return;
    }
    const newAsset: any = {
      id: `AST-${assetsList.length + 1}`,
      tag: assetTag || `AST-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: assetName,
      company: assetMappedCompany,
      category: 'Machinery',
      model: assetModel || 'Standard Industrial Unit',
      serial: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Active',
      amcStatus: 'Active AMC',
      warrantyExpires: '2027-12-31'
    };
    setAssetsList([newAsset, ...assetsList]);
    toast.success(`Asset ${assetName} Mapped to ${assetMappedCompany}!`, {
      description: `Equipment Tag ${newAsset.tag} is now available for ${assetMappedCompany} users to raise support tickets.`
    });
    setAssetModalOpen(false);
    setAssetName('');
    setAssetTag('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Master Management & Asset Mapping"
        description="Master registry to onboard companies, create users, map tenant access, and assign machinery assets"
      >
        <div className="flex gap-2">
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
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-secondary/40 p-1 border border-border rounded-xl">
          <TabsTrigger value="companies" className="gap-2 text-xs"><Building2 className="w-3.5 h-3.5 text-primary" /> Company Master ({companiesList.length})</TabsTrigger>
          <TabsTrigger value="users" className="gap-2 text-xs"><Users className="w-3.5 h-3.5 text-amber-400" /> User & Role Mapping ({usersList.length})</TabsTrigger>
          <TabsTrigger value="assets" className="gap-2 text-xs"><Package className="w-3.5 h-3.5 text-emerald-400" /> Asset & Equipment Mapping ({assetsList.length})</TabsTrigger>
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
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Tab 1: Companies Master */}
        <TabsContent value="companies" className="mt-4 space-y-4">
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
                        <span className="font-bold text-amber-400">{comp.usersCount} users</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mapped Assets:</span>
                        <span className="font-bold text-emerald-400">{comp.assetsCount} assets</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Tenant Isolated
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => toast.info(`Editing ${comp.name} Master`)} className="text-xs gap-1">
                      <Edit3 className="w-3.5 h-3.5" /> Edit Master
                    </Button>
                  </div>
                </div>
              ))}
          </div>
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
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => toast.info(`Re-mapping ${usr.name}`)} className="text-xs gap-1">
                          <Edit3 className="w-3 h-3 text-primary" /> Edit Mapping
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 3: Asset & Product Mapping Master */}
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
                        <Button variant="ghost" size="sm" onClick={() => toast.info(`Re-mapping asset ${ast.tag}`)} className="text-xs gap-1">
                          <Edit3 className="w-3 h-3 text-primary" /> Re-map Company
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
                placeholder="E.g., Umbrella Corporation"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Company Code</label>
                <input 
                  type="text" 
                  value={compCode}
                  onChange={(e) => setCompCode(e.target.value)}
                  placeholder="UMBR"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Industry Sector</label>
                <select 
                  value={compIndustry}
                  onChange={(e) => setCompIndustry(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                >
                  <option value="Industrial Manufacturing">Industrial Manufacturing</option>
                  <option value="Electronics & Automation">Electronics & Automation</option>
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
                placeholder="admin@umbrella.com"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
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
              <UserPlus className="w-5 h-5 text-amber-400" /> Create User & Assign Access Scope
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Set user role as KAA Admin/Staff (Global) or Client User (Scoped to Company).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Full Name *</label>
              <input 
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="E.g., Michael Scott"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">User Email Address *</label>
              <input 
                type="email" 
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="michael@dundermifflin.com"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Account Type</label>
              <select 
                value={userRoleType}
                onChange={(e: any) => setUserRoleType(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              >
                <option value="Client User">Client User (Scoped to 1 Client Company)</option>
                <option value="KAA Internal Staff">KAA Internal Staff (Admin Command Access)</option>
              </select>
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
                <p className="text-[10px] text-muted-foreground mt-1">When logging in, this user will only see tickets and equipment belonging to {userMappedCompany}.</p>
              </div>
            )}

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

      {/* Modal 3: Map Asset/Product to Company */}
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
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
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
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Model / Specs</label>
                <input 
                  type="text" 
                  value={assetModel}
                  onChange={(e) => setAssetModel(e.target.value)}
                  placeholder="CPU 1518-4 PN/DP"
                  className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
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
    </div>
  );
}
