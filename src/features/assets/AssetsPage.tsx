import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Cpu, QrCode, Search, Plus, Printer, History, Building2, FileSpreadsheet, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMasterStore } from '@/stores/master-store';
import { useAuthStore } from '@/stores/auth-store';
import { Link } from 'react-router-dom';
import { AssetExcelImportModal } from './AssetExcelImportModal';
import { EditAssetModal } from './EditAssetModal';

export default function AssetsPage() {
  const { isKaaInternal, userCompany } = useAuthStore();
  const { assets: assetsList, companies: companiesList, hardwareTypes, addAsset, addHardwareType } = useMasterStore();
  const activeCompanies = companiesList.filter(company => company.is_active);

  const [searchTerm, setSearchTerm] = useState('');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<any>(null);

  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetTag, setNewAssetTag] = useState('');
  const [newAssetModel, setNewAssetModel] = useState('');
  const [newAssetHardwareType, setNewAssetHardwareType] = useState('PLC / Controller');
  const [customHardwareType, setCustomHardwareType] = useState('');
  const [isCustomType, setIsCustomType] = useState(false);
  const [newAssetSerial, setNewAssetSerial] = useState('');
  const [newAssetUser, setNewAssetUser] = useState('');
  const [newAssetCompany, setNewAssetCompany] = useState('');

  const handleOpenRegister = () => {
    if (activeCompanies.length === 0) {
      toast.error('No active companies are available. Activate or onboard a company in Admin Masters first.');
      return;
    }
    setNewAssetCompany(activeCompanies[0].name);
    setNewAssetHardwareType(hardwareTypes[0]?.name || 'PLC / Controller');
    setIsCustomType(false);
    setCustomHardwareType('');
    setRegisterModalOpen(true);
  };

  const normalize = (s?: string) => (s || '').trim().toLowerCase();
  const targetCompany = normalize(userCompany || '');
  const tenantAssets = assetsList.filter(asset => {
    if (isKaaInternal || !targetCompany) return true;
    const assetComp = normalize(asset.company || '');
    return assetComp === targetCompany || assetComp.includes(targetCompany) || targetCompany.includes(assetComp);
  });

  const filteredAssets = tenantAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.hardwareType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenHistory = (asset: any) => {
    setSelectedAsset(asset);
    setHistoryModalOpen(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim()) {
      toast.error('Please enter equipment name');
      return;
    }

    const selectedComp = newAssetCompany || activeCompanies[0]?.name;
    if (!selectedComp) {
      toast.error('Please select an owner company');
      return;
    }

    const finalType = isCustomType ? (customHardwareType.trim() || 'Machinery') : newAssetHardwareType;

    // Save custom type to master store if new
    if (isCustomType && customHardwareType.trim()) {
      addHardwareType(customHardwareType.trim()).catch(() => {});
    }

    try {
      const created = await addAsset({
        tag: newAssetTag.trim() || `AST-2026-${Math.floor(100 + Math.random() * 900)}`,
        name: newAssetName.trim(),
        company: selectedComp,
        hardwareType: finalType,
        category: finalType,
        model: newAssetModel.trim() || 'Standard Machinery Unit',
        serial: newAssetSerial.trim() || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        assetUser: newAssetUser.trim() || '',
        status: 'Active',
        amcStatus: 'Active AMC',
        warrantyExpires: '2027-12-31'
      });

      toast.success(`Asset ${created.name} Registered!`, {
        description: `Tag ${created.tag} assigned under ${selectedComp} (${finalType}).`
      });

      setRegisterModalOpen(false);
      setNewAssetName('');
      setNewAssetTag('');
      setNewAssetModel('');
      setNewAssetSerial('');
      setNewAssetUser('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not register asset.');
    }
  };

  const handlePrintQR = () => {
    toast.success('QR Code Barcode Label Sent to Printer', {
      description: 'Barcode printable label preview generated.'
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Registry & Equipment"
        description="Track machinery, servers, hardware components, warranties and AMC contract links"
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setQrModalOpen(true)} className="gap-2 text-xs">
            <QrCode className="w-4 h-4 text-primary" /> Scan / Print QR
          </Button>

          {isKaaInternal && (
            <>
              <Button variant="outline" onClick={() => setExcelModalOpen(true)} className="gap-2 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Import Excel / CSV
              </Button>
              <Button variant="default" onClick={handleOpenRegister} className="gap-2 text-xs">
                <Plus className="w-4 h-4" /> Register Asset
              </Button>
            </>
          )}
        </div>
      </PageHeader>

      <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <label htmlFor="asset-search" className="sr-only">Search assets</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="asset-search"
            name="asset-search"
            type="text"
            placeholder="Search by asset tag, name, serial number, hardware type or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary text-foreground"
          />
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center border border-border flex flex-col items-center justify-center">
          <Cpu className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-bold text-foreground">No Machinery Assets Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {companiesList.length === 0 
              ? "Onboard a client company in Admin Masters first, then click below to register an asset."
              : "Click 'Register Asset' or 'Import Excel' above to add machinery to your client registry."}
          </p>
          <div className="flex gap-2 mt-4">
            {isKaaInternal && (
              <Button onClick={() => setExcelModalOpen(true)} variant="outline" size="sm" className="gap-2 text-xs">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Import Excel
              </Button>
            )}
            {companiesList.length === 0 ? (
              <Link to="/masters">
                <Button size="sm" className="gap-2 text-xs">
                  <Building2 className="w-4 h-4" /> Go to Admin Masters
                </Button>
              </Link>
            ) : (
              <Button onClick={handleOpenRegister} size="sm" className="gap-2 text-xs">
                <Plus className="w-4 h-4" /> Register Asset
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all flex flex-col justify-between space-y-4 shadow-lg group">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                      {asset.tag}
                    </Badge>
                    <Badge variant={asset.status === 'Active' ? 'success' : 'secondary'} className="text-[10px]">
                      {asset.status}
                    </Badge>
                  </div>
                </div>

                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{asset.name}</h3>
                <div className="flex items-center gap-2 mt-1 mb-3">
                  <span className="text-xs font-semibold text-emerald-400">{asset.company}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-700">
                    {asset.hardwareType || asset.category}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/50">
                  <div className="flex justify-between">
                    <span>Model:</span>
                    <span className="font-mono text-foreground font-medium">{asset.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Serial No:</span>
                    <span className="font-mono text-foreground">{asset.serial}</span>
                  </div>
                  {asset.assetUser && (
                    <div className="flex justify-between">
                      <span>Assigned User:</span>
                      <span className="text-foreground font-medium">{asset.assetUser}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>AMC Contract:</span>
                    <span className="text-emerald-400 font-semibold">{asset.amcStatus}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground">Expires: {asset.warrantyExpires}</span>
                <div className="flex items-center gap-1.5">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setAssetToEdit(asset);
                      setEditModalOpen(true);
                    }} 
                    className="text-xs gap-1 h-7 border-border hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenHistory(asset)} className="text-xs gap-1 h-7 text-primary hover:text-primary">
                    <History className="w-3.5 h-3.5" /> History
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Asset Modal */}
      <Dialog open={registerModalOpen} onOpenChange={setRegisterModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" /> Register New Machinery Asset
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a piece of equipment to client registry. Hardware type and serial number are mapped to support tickets.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="reg-asset-name" className="text-xs font-medium text-foreground">Equipment Name *</label>
              <input 
                id="reg-asset-name"
                name="assetName"
                type="text" 
                value={newAssetName}
                onChange={(e) => setNewAssetName(e.target.value)}
                placeholder="E.g., Siemens S7-1500 PLC Rack"
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="reg-asset-tag" className="text-xs font-medium text-foreground">Asset Tag Code</label>
                <input 
                  id="reg-asset-tag"
                  name="assetTag"
                  type="text" 
                  value={newAssetTag}
                  onChange={(e) => setNewAssetTag(e.target.value)}
                  placeholder="AST-2026-991"
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-asset-model" className="text-xs font-medium text-foreground">Model / Specs</label>
                <input 
                  id="reg-asset-model"
                  name="assetModel"
                  type="text" 
                  value={newAssetModel}
                  onChange={(e) => setNewAssetModel(e.target.value)}
                  placeholder="CPU 1518-4 PN/DP"
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Hardware Type Master Dropdown */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor={isCustomType ? "reg-asset-hw-custom" : "reg-asset-hw-type"} className="text-xs font-medium text-foreground">Hardware Type *</label>
                <button
                  type="button"
                  onClick={() => setIsCustomType(!isCustomType)}
                  className="text-[10px] text-primary hover:underline"
                >
                  {isCustomType ? '← Select Existing' : '+ Enter Custom Type'}
                </button>
              </div>

              {isCustomType ? (
                <input
                  id="reg-asset-hw-custom"
                  name="customHardwareType"
                  type="text"
                  value={customHardwareType}
                  onChange={(e) => setCustomHardwareType(e.target.value)}
                  placeholder="E.g., Robotic Gripper Arm"
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                />
              ) : (
                <select
                  id="reg-asset-hw-type"
                  name="hardwareType"
                  value={newAssetHardwareType}
                  onChange={(e) => setNewAssetHardwareType(e.target.value)}
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary font-medium"
                >
                  {hardwareTypes.map((hw) => (
                    <option key={hw.id} value={hw.name}>{hw.name}</option>
                  ))}
                  {hardwareTypes.length === 0 && (
                    <>
                      <option value="PLC / Controller">PLC / Controller</option>
                      <option value="VFD / Motor Drive">VFD / Motor Drive</option>
                      <option value="HMI / Touch Panel">HMI / Touch Panel</option>
                      <option value="Server / Rack">Server / Rack</option>
                      <option value="Workstation / Laptop">Workstation / Laptop</option>
                      <option value="Industrial Machinery">Industrial Machinery</option>
                    </>
                  )}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="reg-asset-serial" className="text-xs font-medium text-foreground">Serial Number</label>
                <input 
                  id="reg-asset-serial"
                  name="serialNumber"
                  type="text" 
                  value={newAssetSerial}
                  onChange={(e) => setNewAssetSerial(e.target.value)}
                  placeholder="SN-998822"
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-asset-user" className="text-xs font-medium text-foreground">Assigned User / Operator</label>
                <input 
                  id="reg-asset-user"
                  name="assetUser"
                  type="text" 
                  value={newAssetUser}
                  onChange={(e) => setNewAssetUser(e.target.value)}
                  placeholder="Line 1 Maintenance"
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="reg-asset-company" className="text-xs font-medium text-foreground">Owner Client Company *</label>
              <select 
                id="reg-asset-company"
                name="company"
                value={newAssetCompany}
                onChange={(e) => setNewAssetCompany(e.target.value)}
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary font-medium"
              >
                {activeCompanies.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setRegisterModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs">
                Save & Register
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Excel Bulk Import Modal */}
      <AssetExcelImportModal open={excelModalOpen} onOpenChange={setExcelModalOpen} />

      {/* QR Code Scanner / Print Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-sm bg-card border-border text-card-foreground p-6 text-center space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-primary" /> QR Asset Tag Scanner
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 bg-secondary/50 rounded-xl border border-border flex flex-col items-center space-y-3">
            <QrCode className="w-24 h-24 text-primary animate-pulse" />
            <p className="text-xs text-muted-foreground font-mono">Scan barcode with mobile camera or scanner</p>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setQrModalOpen(false)} className="text-xs">
              Close
            </Button>
            <Button size="sm" onClick={handlePrintQR} className="text-xs gap-1">
              <Printer className="w-3.5 h-3.5" /> Print Tag Label
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service History Modal */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-primary" /> Service History: {selectedAsset?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tag: {selectedAsset?.tag} ({selectedAsset?.company})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="p-3 bg-secondary/50 rounded-lg border border-border space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-primary">No previous service logs recorded.</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Asset & Reassignment Modal */}
      <EditAssetModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        asset={assetToEdit}
      />
    </div>
  );
}
