import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockAssets } from '@/lib/mock-data';
import { Cpu, QrCode, Search, ShieldCheck, Wrench, Plus, AlertTriangle, Printer, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetModel, setNewAssetModel] = useState('');
  const [newAssetCompany, setNewAssetCompany] = useState('Acme Corp');

  const filteredAssets = mockAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenHistory = (asset: any) => {
    setSelectedAsset(asset);
    setHistoryModalOpen(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim()) {
      toast.error('Please enter asset name');
      return;
    }
    toast.success(`Asset ${newAssetName} Registered!`, {
      description: `Tag AST-2026-${Math.floor(100 + Math.random() * 900)} assigned under ${newAssetCompany}.`
    });
    setRegisterModalOpen(false);
    setNewAssetName('');
    setNewAssetModel('');
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setQrModalOpen(true)} className="gap-2">
            <QrCode className="w-4 h-4 text-primary" /> Scan / Print QR
          </Button>
          <Button variant="default" onClick={() => setRegisterModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Register Asset
          </Button>
        </div>
      </PageHeader>

      <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by asset tag, name, serial number or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all flex flex-col justify-between space-y-4 shadow-lg">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Cpu className="w-6 h-6" />
                </div>
                <Badge variant={asset.status === 'Active' ? 'success' : 'warning'}>
                  {asset.status}
                </Badge>
              </div>

              <span className="text-xs font-mono text-primary font-bold">{asset.tag}</span>
              <h3 className="font-semibold text-base text-foreground mt-1 mb-1">{asset.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">Client: <span className="font-medium text-foreground">{asset.company}</span></p>

              <div className="space-y-2 text-xs text-muted-foreground bg-secondary/40 p-3 rounded-lg border border-border/50 font-mono">
                <div className="flex justify-between">
                  <span>Model:</span>
                  <span className="font-medium text-foreground">{asset.model}</span>
                </div>
                <div className="flex justify-between">
                  <span>Serial:</span>
                  <span className="text-foreground">{asset.serial}</span>
                </div>
                <div className="flex justify-between">
                  <span>Warranty:</span>
                  <span className="text-foreground">{asset.warrantyExpires}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs">
                {asset.amcStatus === 'Active AMC' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Covered under AMC
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> No AMC Coverage
                  </span>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleOpenHistory(asset)}
                className="text-xs gap-1 hover:text-primary"
              >
                <Wrench className="w-3.5 h-3.5" /> History
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Register Asset Modal */}
      <Dialog open={registerModalOpen} onOpenChange={setRegisterModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Register New Machinery Asset</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add equipment to the central asset registry with serial and warranty specs.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Equipment Name</label>
              <input 
                type="text" 
                value={newAssetName}
                onChange={(e) => setNewAssetName(e.target.value)}
                placeholder="E.g., Siemens S7-1500 PLC Rack"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Model / Serial Number</label>
              <input 
                type="text" 
                value={newAssetModel}
                onChange={(e) => setNewAssetModel(e.target.value)}
                placeholder="E.g., S7-1518-4 PN/DP (SN: 99481A)"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Owner Company</label>
              <select 
                value={newAssetCompany}
                onChange={(e) => setNewAssetCompany(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              >
                <option value="Acme Corp">Acme Corp</option>
                <option value="Globex Ltd">Globex Ltd</option>
                <option value="Initech Inc">Initech Inc</option>
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
                <span className="font-bold text-primary">TKT-1064</span>
                <span className="text-emerald-400 font-semibold">Resolved</span>
              </div>
              <p className="text-xs font-medium text-foreground">PLC module replacement & firmware flash</p>
              <p className="text-[10px] text-muted-foreground">Serviced by Alex Johnson on 2026-08-01</p>
            </div>

            <div className="p-3 bg-secondary/50 rounded-lg border border-border space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-primary">TKT-1052</span>
                <span className="text-emerald-400 font-semibold">Preventive Maintenance</span>
              </div>
              <p className="text-xs font-medium text-foreground">Quarterly AMC inspection & calibration</p>
              <p className="text-[10px] text-muted-foreground">Serviced by Priya Sharma on 2026-06-15</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
