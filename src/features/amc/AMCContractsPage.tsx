import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Plus, CheckCircle2, ShieldCheck, Download, Calendar, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMasterStore } from '@/stores/master-store';
import { useAuthStore } from '@/stores/auth-store';
import { Link } from 'react-router-dom';

export default function AMCContractsPage() {
  const { isKaaInternal, userCompany } = useAuthStore();
  const { amcContracts: allContracts, companies, addAMCContract } = useMasterStore();
  const [modalOpen, setModalOpen] = useState(false);
  
  const normalize = (s?: string) => (s || '').trim().toLowerCase();
  const targetCompany = normalize(userCompany || '');
  const contracts = allContracts.filter(c => {
    if (isKaaInternal || !targetCompany) return true;
    const amcComp = normalize(c.company || '');
    return amcComp === targetCompany || amcComp.includes(targetCompany) || targetCompany.includes(amcComp);
  });

  const [contractName, setContractName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [totalVisits, setTotalVisits] = useState('12');
  const [includedLabor, setIncludedLabor] = useState(true);

  const handleOpenModal = () => {
    if (companies.length === 0) {
      toast.error('No companies registered yet. Onboard a company in Admin Masters first.');
      return;
    }
    setCompanyName(companies[0].name);
    setModalOpen(true);
  };

  const handleDownloadAMC_PDF = (contract: any) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to generate AMC PDF agreement.');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>AMC Agreement - ${contract.contractNumber}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 20px; background: #fff; }
              .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #10b981; padding-bottom: 15px; margin-bottom: 20px; }
              .brand { font-size: 22px; font-weight: 800; color: #059669; }
              .sub-brand { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
              .contract-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 5px 0; }
              .badge { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; display: inline-block; }

              .grid-box { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
              .label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }
              .val { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }

              .terms { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; font-size: 11px; color: #334155; line-height: 1.6; }
              .footer { border-top: 2px solid #e2e8f0; padding-top: 15px; margin-top: 30px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8; }
              .sig { border: 1px dashed #cbd5e1; padding: 10px; border-radius: 6px; width: 160px; text-align: center; }
            </style>
          </head>
          <body>
            <div className="header-bar">
              <div>
                <div className="brand">KAA SUPPORT PORTAL</div>
                <div className="sub-brand">Annual Maintenance Contract (AMC) Agreement</div>
              </div>
              <div style="text-align: right;">
                <span className="badge">✓ ACTIVE SLA CONTRACT</span>
                <p style="font-size: 11px; color: #64748b; margin: 5px 0 0 0;">Ref: <strong>${contract.contractNumber}</strong></p>
              </div>
            </div>

            <h2 className="contract-title">${contract.name}</h2>
            <p style="font-size: 11px; color: #64748b; margin-top: 0;">Official SLA maintenance service agreement between KAA ERP Support & Client.</p>

            <div className="grid-box">
              <div>
                <div className="label">CLIENT COMPANY</div>
                <div className="val">${contract.company}</div>
              </div>
              <div>
                <div className="label">CONTRACT NUMBER</div>
                <div className="val" style="color: #059669;">${contract.contractNumber}</div>
              </div>
              <div>
                <div className="label">ANNUAL VISIT QUOTA</div>
                <div className="val">${contract.usedVisits} Used / ${contract.totalVisits} Total</div>
              </div>
              <div>
                <div className="label">CONTRACT PERIOD</div>
                <div className="val">${contract.startDate} to ${contract.endDate}</div>
              </div>
              <div>
                <div className="label">LABOR INCLUSION</div>
                <div className="val" style="color: #10b981;">${contract.includedLabor ? 'Full Onsite Labor Covered' : 'Parts Only'}</div>
              </div>
              <div>
                <div className="label">SLA RESPONSE GUARANTEE</div>
                <div className="val">2-Hour Emergency Dispatch</div>
              </div>
            </div>

            <div className="terms">
              <strong style="color: #0f172a; display: block; margin-bottom: 5px;">AGREEMENT TERMS & CONDITIONS:</strong>
              1. Preventative maintenance visits include routine inspection of PLC racks, VFD drives, and field sensors.<br/>
              2. Emergency tickets raised under this AMC contract take SLA priority with zero labor surcharge.<br/>
              3. Unused visit quotas automatically roll over to the next contract quarter upon renewal.
            </div>

            <div className="footer">
              <div>
                <p>Agreement Generated: <strong>${new Date().toLocaleDateString()}</strong></p>
                <p>KAA Enterprise Asset & AMC Division</p>
              </div>
              <div className="sig">
                <p style="margin: 0 0 15px 0; color: #94a3b8; font-size: 8px;">AUTHORIZED SIGNATURE & STAMP</p>
                <p style="margin: 0; font-weight: bold; color: #475569;">KAA Service Lead</p>
              </div>
            </div>

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 300);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();

      toast.success(`AMC Agreement PDF Generated (${contract.contractNumber})`, {
        description: 'Opened printable AMC PDF window.'
      });
    } catch {
      toast.error('Failed to generate AMC PDF agreement.');
    }
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractName.trim()) {
      toast.error('Please enter contract title');
      return;
    }

    const selectedComp = companyName || companies[0]?.name;
    if (!selectedComp) {
      toast.error('Please select a company');
      return;
    }

    const newContract = addAMCContract({
      name: contractName.trim(),
      company: selectedComp,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      totalVisits: parseInt(totalVisits) || 12,
      usedVisits: 0,
      status: 'Active',
      includedLabor: includedLabor
    });

    toast.success(`AMC Contract ${newContract.contractNumber} Activated!`, {
      description: `Registered for ${newContract.company} with ${newContract.totalVisits} annual maintenance visits.`
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
        {isKaaInternal && (
          <Button variant="default" onClick={handleOpenModal} className="gap-2 text-xs">
            <Plus className="w-4 h-4" /> New AMC Contract
          </Button>
        )}
      </PageHeader>

      {contracts.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center border border-border flex flex-col items-center justify-center">
          <ShieldCheck className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-bold text-foreground">No Active AMC Contracts</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {companies.length === 0 
              ? "Onboard a client company in Admin Masters first, then click below to register an AMC contract." 
              : "Click 'New AMC Contract' above to register an Annual Maintenance Contract for client equipment."}
          </p>
          {companies.length === 0 ? (
            <Link to="/masters">
              <Button size="sm" className="mt-4 gap-2 text-xs">
                <Building2 className="w-4 h-4" /> Go to Admin Masters
              </Button>
            </Link>
          ) : (
            <Button onClick={handleOpenModal} size="sm" className="mt-4 gap-2 text-xs">
              <Plus className="w-4 h-4" /> New AMC Contract
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contracts.map((contract: any) => {
            const usedPct = Math.round(((contract.usedVisits || 0) / (contract.totalVisits || 1)) * 100);
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
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-primary" /> {contract.company}
                    </p>
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDownloadAMC_PDF(contract)} 
                    className="text-xs gap-1 hover:text-emerald-400"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF Agreement
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
              <select 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary font-medium"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Total Visit Quota</label>
                <input 
                  type="number" 
                  value={totalVisits}
                  onChange={(e) => setTotalVisits(e.target.value)}
                  placeholder="12"
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1 flex flex-col justify-end pb-1">
                <label className="text-xs font-medium text-foreground mb-2">Labor Inclusion</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="laborCheck"
                    checked={includedLabor} 
                    onChange={(e) => setIncludedLabor(e.target.checked)}
                    className="rounded border-border"
                  />
                  <label htmlFor="laborCheck" className="text-xs text-foreground cursor-pointer">Includes Onsite Labor</label>
                </div>
              </div>
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
