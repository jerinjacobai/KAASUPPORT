import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cpu, User, Building2, Tag, Hash, FileText, CheckCircle2, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { useMasterStore, type AssetMaster } from '@/stores/master-store';
import { useAuthStore } from '@/stores/auth-store';

interface EditAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: AssetMaster | null;
  onSaved?: () => void;
}

export function EditAssetModal({ open, onOpenChange, asset, onSaved }: EditAssetModalProps) {
  const { isKaaInternal } = useAuthStore();
  const { companies, users, hardwareTypes, updateAsset, addHardwareType } = useMasterStore();

  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [company, setCompany] = useState('');
  const [hardwareType, setHardwareType] = useState('');
  const [isCustomType, setIsCustomType] = useState(false);
  const [customType, setCustomType] = useState('');
  const [selectedUserMode, setSelectedUserMode] = useState<'existing' | 'custom' | 'unassigned'>('existing');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [customUserName, setCustomUserName] = useState('');
  const [status, setStatus] = useState<'Active' | 'Maintenance' | 'Retired' | 'In Stock'>('Active');
  const [amcStatus, setAmcStatus] = useState('Active AMC');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available users for this asset's company
  const companyUsers = users.filter(u => 
    !company || u.mappedCompany.toLowerCase() === company.toLowerCase() || u.mappedCompany.includes(company)
  );

  useEffect(() => {
    if (asset) {
      setName(asset.name || '');
      setTag(asset.tag || '');
      setModel(asset.model || '');
      setSerial(asset.serial === 'N/A' ? '' : (asset.serial || ''));
      setCompany(asset.company || 'ISS Global Forwarding W.L.L');
      
      const type = asset.hardwareType || asset.category || 'Laptops';
      const knownType = hardwareTypes.some(h => h.name.toLowerCase() === type.toLowerCase());
      if (knownType || type) {
        setHardwareType(type);
        setIsCustomType(false);
        setCustomType('');
      } else {
        setIsCustomType(true);
        setCustomType(type);
      }

      // Check assigned user
      const existingUser = companyUsers.find(u => u.name.toLowerCase() === (asset.assetUser || '').toLowerCase());
      if (!asset.assetUser) {
        setSelectedUserMode('unassigned');
        setSelectedUserId('');
        setCustomUserName('');
      } else if (existingUser) {
        setSelectedUserMode('existing');
        setSelectedUserId(existingUser.id);
        setCustomUserName('');
      } else {
        setSelectedUserMode('custom');
        setSelectedUserId('');
        setCustomUserName(asset.assetUser);
      }

      const st = (asset.status || 'Active').toLowerCase();
      if (st.includes('maint')) setStatus('Maintenance');
      else if (st.includes('retir') || st.includes('disp')) setStatus('Retired');
      else if (st.includes('stock')) setStatus('In Stock');
      else setStatus('Active');

      setAmcStatus(asset.amcStatus || 'Active AMC');
      setRemarks(asset.remarks || asset.description || '');
    }
  }, [asset, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;

    if (!name.trim()) {
      toast.error('Please specify the equipment name');
      return;
    }

    const finalType = isCustomType ? (customType.trim() || 'Laptops') : (hardwareType || 'Laptops');

    if (isCustomType && customType.trim()) {
      addHardwareType(customType.trim()).catch(() => {});
    }

    let finalAssetUser = '';
    if (selectedUserMode === 'existing') {
      const found = companyUsers.find(u => u.id === selectedUserId);
      finalAssetUser = found ? found.name : '';
    } else if (selectedUserMode === 'custom') {
      finalAssetUser = customUserName.trim();
    } else {
      finalAssetUser = ''; // Unassigned
    }

    setIsSubmitting(true);
    try {
      await updateAsset(asset.id, {
        name: name.trim(),
        tag: tag.trim() || asset.tag,
        model: model.trim() || 'Standard Unit',
        serial: serial.trim() || 'N/A',
        company: company || asset.company,
        hardwareType: finalType,
        category: finalType,
        assetUser: finalAssetUser,
        status: status,
        amcStatus: amcStatus,
        remarks: remarks.trim()
      });

      toast.success(`Asset "${name}" updated successfully!`, {
        description: finalAssetUser ? `Assigned to ${finalAssetUser}` : 'Marked as unassigned / in stock'
      });

      onOpenChange(false);
      if (onSaved) onSaved();
    } catch (err) {
      toast.error('Failed to update asset', {
        description: err instanceof Error ? err.message : 'Please check connection'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-card border-border text-card-foreground p-6 space-y-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" /> Edit Asset & Product Assignment
            </DialogTitle>
            <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
              {asset.tag}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Update asset specifications or reassign this device (laptop, monitor, phone, etc.) to another employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Equipment Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-primary" /> Equipment / Product Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lenovo ThinkPad (Alex Raju Abraham)"
              className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              required
            />
          </div>

          {/* User Reassignment Section */}
          <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> Assign to Employee / User
              </label>
              <div className="flex gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedUserMode('existing')}
                  className={`px-2 py-0.5 rounded transition-colors ${selectedUserMode === 'existing' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-secondary'}`}
                >
                  From Company List
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserMode('custom')}
                  className={`px-2 py-0.5 rounded transition-colors ${selectedUserMode === 'custom' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-secondary'}`}
                >
                  Custom Name
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserMode('unassigned')}
                  className={`px-2 py-0.5 rounded transition-colors ${selectedUserMode === 'unassigned' ? 'bg-amber-500 text-black font-semibold' : 'text-muted-foreground hover:bg-secondary'}`}
                >
                  Unassign
                </button>
              </div>
            </div>

            {selectedUserMode === 'existing' && (
              <div className="space-y-1">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-background border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                >
                  <option value="">Select an employee from {company || 'company'}...</option>
                  {companyUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — ({u.roleName || 'Employee'}) [{u.email}]
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  {companyUsers.length} employees registered under {company || 'ISS Global Forwarding W.L.L'}.
                </p>
              </div>
            )}

            {selectedUserMode === 'custom' && (
              <div className="space-y-1">
                <input
                  type="text"
                  value={customUserName}
                  onChange={(e) => setCustomUserName(e.target.value)}
                  placeholder="Enter employee or contractor name..."
                  className="w-full bg-background border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>
            )}

            {selectedUserMode === 'unassigned' && (
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-400">
                This asset will be marked as unassigned and returned to company IT stock.
              </div>
            )}
          </div>

          {/* Hardware Type & Company Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Hardware Type */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" /> Hardware Type *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomType(!isCustomType)}
                  className="text-[10px] text-primary hover:underline"
                >
                  {isCustomType ? 'Select from list' : '+ Custom'}
                </button>
              </div>

              {!isCustomType ? (
                <select
                  value={hardwareType}
                  onChange={(e) => setHardwareType(e.target.value)}
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                >
                  {hardwareTypes.map((hw) => (
                    <option key={hw.id} value={hw.name}>
                      {hw.name}
                    </option>
                  ))}
                  <option value="Laptops">Laptops</option>
                  <option value="Monitor">Monitor</option>
                  <option value="IP-Phone">IP-Phone</option>
                  <option value="Peripherals">Peripherals</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Server">Server</option>
                  <option value="Network Switch">Network Switch</option>
                  <option value="Printer">Printer</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="e.g. Barcode Scanner"
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                />
              )}
            </div>

            {/* Owner Company */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Company Scope
              </label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={!isKaaInternal}
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary disabled:opacity-70"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Model & Serial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Model / Specs
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. ThinkPad T14 / L22 Monitor"
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" /> Serial Number
              </label>
              <input
                type="text"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="e.g. PF-3ABCD9"
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary font-mono"
              />
            </div>
          </div>

          {/* Status & Tag Code Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Operational Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              >
                <option value="Active">Active (In Use)</option>
                <option value="Maintenance">In Maintenance / Repair</option>
                <option value="In Stock">In Storage / Available</option>
                <option value="Retired">Retired / Decommissioned</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Asset Tag Code</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="AST-2026-001"
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary font-mono"
              />
            </div>
          </div>

          {/* Remarks / Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Remarks / Hardware Notes
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Upgraded to 16GB RAM, power adapter replaced, user transferred to Accounts"
              rows={2}
              className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20"
            >
              <CheckCircle2 className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save & Reassign Asset'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
