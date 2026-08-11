import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockAMCContracts as initialContracts } from '@/lib/mock-data';
import { Plus, CheckCircle2, ShieldCheck, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function AMCContractsPage() {
  const [contracts, setContracts] = useState<any[]>(initialContracts);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [contractName, setContractName] = useState('');
  const [companyName, setCompanyName] = useState('Acme Corp');
  const [totalVisits, setTotalVisits] = useState('12');

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractName.trim()) {
      toast.error('Please enter contract name');
      return;
    }

    const newContract = {
      id: `AMC-2026-00${contracts.length + 1}`,
      contractNumber: `AMC-2026-00${contracts.length + 1}`,
      name: contractName,
      company: companyName,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      totalVisits: parseInt(totalVisits) || 12,
      usedVisits: 0,
      status: 'Active',
      includedLabor: true
    };

    setContracts([newContract, ...contracts]);
    toast.success(`AMC Contract ${newContract.contractNumber} Activated!`, {
      description: `Registered for ${companyName} with ${newContract.totalVisits} annual maintenance visits.`
    });
    setModalOpen(false);
    setContractName('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AMC Maintenance Contracts"
        description="Manage Annual Maintenance Contracts, preventative visit quotas, SLA agreements, and renewals"
      >
        <Button variant="default" onClick={() => setModalOpen(true)} className="gap-2 text-xs">
          <Plus className="w-4 h-4" /> New AMC Contract
        </Button>
      </PageHeader>

      {contracts.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center border border-border flex flex-col items-center justify-center">
          <ShieldCheck className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-bold text-foreground">No Active AMC Contracts</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">Click "New AMC Contract" above to register an Annual Maintenance Contract for client equipment.</p>
          <Button onClick={() => setModalOpen(true)} size="sm" className="mt-4 gap-2 text-xs">
            <Plus className="w-4 h-4" /> New AMC Contract
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contracts.map((contract: any) => {
            const usedPct = Math.round((contract.usedVisits / contract.totalVisits) * 100);
            return (
              <div key={contract.id} className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all flex flex-col justify-between space-y-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 font-semibold">
                      {contract.status}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-foreground">{contract.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{contract.company}</p>
                    <p className="text-[11px] font-mono text-primary mt-1">{contract.contractNumber}</p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Visits Quota:</span>
                      <span className="text-foreground">{contract.usedVisits} / {contract.totalVisits} Used</span>
                    </div>
                    <Progress value={usedPct} className="h-2" />
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/50">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-muted-foreground" /> Period:</span>
                      <span className="font-mono text-foreground">{contract.startDate} to {contract.endDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Labor Included:</span>
                      <span className="text-emerald-400 font-semibold">{contract.includedLabor ? 'Yes (Full Support)' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Covered by SLA
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => toast.success(`Downloading Agreement PDF for ${contract.contractNumber}`)} className="text-xs gap-1">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New AMC Contract Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> New Annual Maintenance Contract
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create a new AMC SLA contract with pre-purchased maintenance visit quotas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateContract} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Contract Title *</label>
              <input 
                type="text" 
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                placeholder="E.g., Annual Comprehensive Automation Support"
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Client Company *</label>
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Total Preventative Visits Quota</label>
              <input 
                type="number" 
                value={totalVisits}
                onChange={(e) => setTotalVisits(e.target.value)}
                placeholder="12"
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs">
                Create & Activate AMC
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
