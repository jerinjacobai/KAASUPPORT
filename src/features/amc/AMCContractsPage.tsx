import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockAMCContracts } from '@/lib/mock-data';
import { ShieldCheck, Calendar, Clock, Plus, FileText, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function AMCContractsPage() {
  const [newContractModalOpen, setNewContractModalOpen] = useState(false);
  const [company, setCompany] = useState('Acme Corp');
  const [visits, setVisits] = useState('12');
  const [value, setValue] = useState('₹1,50,000 / year');

  const handleDownloadPDF = (contractNumber: string, companyName: string) => {
    toast.success(`Downloading Agreement PDF`, {
      description: `AMC-${contractNumber} agreement document for ${companyName}.`
    });
  };

  const handleRenewContract = (contractNumber: string, companyName: string) => {
    toast.success(`AMC Renewal Requested`, {
      description: `Contract ${contractNumber} for ${companyName} queued for 1-year renewal.`
    });
  };

  const handleCreateContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`AMC Contract Created!`, {
      description: `Contract for ${company} registered with ${visits} annual visits quota.`
    });
    setNewContractModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Annual Maintenance Contracts (AMC)"
        description="Manage client service agreements, response SLAs, visit deductions, and renewals"
      >
        <Button variant="default" onClick={() => setNewContractModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New AMC Contract
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockAMCContracts.map((contract) => {
          const usedPct = Math.round((contract.usedVisits / contract.totalVisits) * 100);
          return (
            <div key={contract.id} className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all flex flex-col justify-between space-y-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <Badge variant={contract.status === 'Active' ? 'success' : 'warning'}>
                    {contract.status}
                  </Badge>
                </div>

                <div>
                  <span className="text-xs font-mono text-primary font-bold">{contract.contractNumber}</span>
                  <h3 className="font-semibold text-lg text-foreground mt-0.5">{contract.company}</h3>
                  <p className="text-sm font-bold text-foreground mt-1">{contract.value}</p>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/50 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> Start Date:</span>
                    <span className="font-medium text-foreground">{contract.startDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> Expiry Date:</span>
                    <span className="font-medium text-foreground">{contract.endDate}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Visits Quota ({contract.usedVisits} / {contract.totalVisits} used)</span>
                    <span className="text-emerald-400 font-bold">{contract.remainingVisits} remaining</span>
                  </div>
                  <Progress value={usedPct} className="h-2" />
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownloadPDF(contract.contractNumber, contract.company)}
                  className="w-full text-xs gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> PDF Agreement
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => handleRenewContract(contract.contractNumber, contract.company)}
                  className="w-full text-xs gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Renew
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New AMC Contract Modal */}
      <Dialog open={newContractModalOpen} onOpenChange={setNewContractModalOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">New Annual Maintenance Contract</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Register a new AMC service agreement with response SLA terms.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateContractSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Client Organization</label>
              <select 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              >
                <option value="Acme Corp">Acme Corp</option>
                <option value="Globex Ltd">Globex Ltd</option>
                <option value="Initech Inc">Initech Inc</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Annual Visit Quota</label>
                <input 
                  type="number" 
                  value={visits}
                  onChange={(e) => setVisits(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Contract Value</label>
                <input 
                  type="text" 
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setNewContractModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs">
                Save & Execute Contract
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
