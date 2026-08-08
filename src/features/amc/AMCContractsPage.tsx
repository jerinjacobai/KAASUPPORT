import { PageHeader } from '@/components/shared/PageHeader';
import { mockAMCContracts } from '@/lib/mock-data';
import { ShieldCheck, Calendar, Clock, Plus, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function AMCContractsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Annual Maintenance Contracts (AMC)"
        description="Manage client service agreements, response SLAs, visit deductions, and renewals"
      >
        <Button variant="default" className="gap-2">
          <Plus className="w-4 h-4" /> New AMC Contract
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockAMCContracts.map((contract) => {
          const usedPct = Math.round((contract.usedVisits / contract.totalVisits) * 100);
          return (
            <div key={contract.id} className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <Badge variant={contract.status === 'Active' ? 'success' : 'warning'}>
                    {contract.status}
                  </Badge>
                </div>

                <div>
                  <span className="text-xs font-mono text-primary font-medium">{contract.contractNumber}</span>
                  <h3 className="font-semibold text-lg text-foreground mt-0.5">{contract.company}</h3>
                  <p className="text-sm font-bold text-foreground mt-1">{contract.value}</p>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/50">
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
                    <span>Visits Limit ({contract.usedVisits} / {contract.totalVisits} used)</span>
                    <span className="text-primary">{contract.remainingVisits} remaining</span>
                  </div>
                  <Progress value={usedPct} className="h-2" />
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-2">
                <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                  <FileText className="w-3.5 h-3.5" /> Agreement PDF
                </Button>
                <Button variant="default" size="sm" className="w-full text-xs gap-1">
                  Renew Contract
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
