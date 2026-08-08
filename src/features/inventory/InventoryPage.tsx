import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockInventoryParts } from '@/lib/mock-data';
import { Package, Search, Warehouse, AlertCircle, Plus, Truck, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParts = mockInventoryParts.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spare Parts & Inventory"
        description="Multi-warehouse stock levels, engineer part reservations, and consumption tracking"
      >
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Truck className="w-4 h-4" /> Purchase Order
          </Button>
          <Button variant="default" className="gap-2">
            <Plus className="w-4 h-4" /> Add Spare Part
          </Button>
        </div>
      </PageHeader>

      <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search spare parts by SKU, name, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="glass rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-base">Warehouse Stock Catalog</h3>
          <span className="text-xs text-muted-foreground">{filteredParts.length} parts registered</span>
        </div>

        <div className="divide-y divide-border">
          {filteredParts.map((part) => (
            <div key={part.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-primary font-medium">{part.sku}</span>
                    <Badge variant="outline" className="text-[10px]">{part.category}</Badge>
                  </div>
                  <h4 className="font-semibold text-sm text-foreground mt-0.5">{part.name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Warehouse className="w-3 h-3 text-muted-foreground" /> {part.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/50">
                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground">Unit Price</p>
                  <p className="font-bold text-sm text-foreground">{part.unitPrice}</p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground">Available Stock</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`font-bold text-sm ${part.stock <= part.minStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {part.stock} units
                    </span>
                    {part.stock <= part.minStock && (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </div>
                </div>

                <Button variant="outline" size="sm" className="text-xs gap-1">
                  Reserve <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
