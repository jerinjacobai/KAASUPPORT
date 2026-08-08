import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockAssets } from '@/lib/mock-data';
import { Cpu, QrCode, Search, ShieldCheck, Wrench, Plus, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = mockAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Registry & Equipment"
        description="Track machinery, servers, hardware components, warranties and AMC contract links"
      >
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <QrCode className="w-4 h-4" /> Scan QR Label
          </Button>
          <Button variant="default" className="gap-2">
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
          <div key={asset.id} className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Cpu className="w-6 h-6" />
                </div>
                <Badge variant={asset.status === 'Active' ? 'success' : 'warning'}>
                  {asset.status}
                </Badge>
              </div>

              <span className="text-xs font-mono text-primary font-medium">{asset.tag}</span>
              <h3 className="font-semibold text-base text-foreground mt-1 mb-1">{asset.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">Client: <span className="font-medium text-foreground">{asset.company}</span></p>

              <div className="space-y-2 text-xs text-muted-foreground bg-secondary/40 p-3 rounded-lg border border-border/50">
                <div className="flex justify-between">
                  <span>Model:</span>
                  <span className="font-medium text-foreground">{asset.model}</span>
                </div>
                <div className="flex justify-between">
                  <span>Serial:</span>
                  <span className="font-mono text-foreground">{asset.serial}</span>
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
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Covered under AMC
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> No AMC Coverage
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <Wrench className="w-3.5 h-3.5" /> Service History
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
