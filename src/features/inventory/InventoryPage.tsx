import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Package, Search, Warehouse, AlertCircle, Plus, Truck, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMasterStore } from '@/stores/master-store';

export default function InventoryPage() {
  const { inventoryParts, addInventoryPart, reserveInventoryStock } = useMasterStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [addPartModalOpen, setAddPartModalOpen] = useState(false);

  const [partName, setPartName] = useState('');
  const [partSku, setPartSku] = useState('');
  const [partCategory, setPartCategory] = useState('Hardware');
  const [partLocation, setPartLocation] = useState('Central Warehouse, Zone A');
  const [partPrice, setPartPrice] = useState('₹12,500');
  const [partStock, setPartStock] = useState('10');

  const filteredParts = (inventoryParts || []).filter((part) =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockParts = (inventoryParts || []).filter(p => p.stock <= p.minStock);

  const handleReservePart = (part: any) => {
    if (part.stock <= 0) {
      toast.error(`Out of Stock: ${part.sku}`, {
        description: 'No units available to reserve. Please issue a restock PO.'
      });
      return;
    }
    reserveInventoryStock(part.id, 1);
    toast.success(`Spare Part Reserved: ${part.sku}`, {
      description: `1 unit of ${part.name} allocated to dispatch. Remaining stock: ${part.stock - 1}`
    });
  };

  const handleAddPartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName.trim()) {
      toast.error('Please enter spare part name');
      return;
    }

    const created = addInventoryPart({
      name: partName.trim(),
      sku: partSku.trim() || `PRT-${Math.floor(1000 + Math.random() * 9000)}`,
      category: partCategory,
      location: partLocation,
      unitPrice: partPrice || '₹12,500',
      stock: parseInt(partStock) || 10,
      minStock: 2
    });

    toast.success(`Spare Part ${created.name} Registered!`, {
      description: `SKU ${created.sku} added to ${created.location} stock catalog.`
    });

    setAddPartModalOpen(false);
    setPartName('');
    setPartSku('');
    setPartPrice('₹12,500');
    setPartStock('10');
  };

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Purchase Order Drafted!`, {
      description: `Restock PO queued for supplier approval.`
    });
    setPoModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spare Parts & Inventory"
        description="Multi-warehouse stock levels, engineer part reservations, and consumption tracking"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPoModalOpen(true)} className="gap-2 text-xs">
            <Truck className="w-4 h-4 text-primary" /> Purchase Order
          </Button>
          <Button variant="default" onClick={() => setAddPartModalOpen(true)} className="gap-2 text-xs">
            <Plus className="w-4 h-4" /> Add Spare Part
          </Button>
        </div>
      </PageHeader>

      <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search spare parts by SKU, name, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary text-foreground"
          />
        </div>
      </div>

      <div className="glass rounded-xl border border-border overflow-hidden shadow-lg">
        <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
          <h3 className="font-semibold text-base text-foreground">Warehouse Stock Catalog</h3>
          <span className="text-xs text-muted-foreground">{filteredParts.length} parts registered</span>
        </div>

        <div className="divide-y divide-border">
          {filteredParts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <h3 className="text-base font-bold text-foreground">No Spare Parts Registered</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">Click "Add Spare Part" above to register components and track warehouse inventory stock.</p>
              <Button onClick={() => setAddPartModalOpen(true)} size="sm" className="mt-4 gap-2 text-xs">
                <Plus className="w-4 h-4" /> Add Spare Part
              </Button>
            </div>
          ) : (
            filteredParts.map((part) => (
              <div key={part.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-primary font-bold">{part.sku}</span>
                      <Badge variant="outline" className="text-[10px]">{part.category}</Badge>
                    </div>
                    <h4 className="font-semibold text-sm text-foreground mt-0.5">{part.name}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-mono">
                      <Warehouse className="w-3.5 h-3.5 text-muted-foreground" /> {part.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/50">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground">Unit Price</p>
                    <p className="font-bold text-sm text-foreground font-mono">{part.unitPrice}</p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground">Available Stock</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`font-bold text-sm ${part.stock <= part.minStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {part.stock} units
                      </span>
                      {part.stock <= part.minStock && (
                        <span title="Low Stock Warning">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
                        </span>
                      )}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleReservePart(part)}
                    className="text-xs gap-1 hover:border-primary hover:text-primary"
                  >
                    Reserve <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Spare Part Modal */}
      <Dialog open={addPartModalOpen} onOpenChange={setAddPartModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add Spare Part to Warehouse</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Register a component SKU in the central inventory catalog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPartSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Part Name *</label>
              <input 
                type="text" 
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                placeholder="E.g., Siemens 24V DC Relay Module"
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">SKU Code</label>
                <input 
                  type="text" 
                  value={partSku}
                  onChange={(e) => setPartSku(e.target.value)}
                  placeholder="PRT-9921"
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Category</label>
                <select 
                  value={partCategory} 
                  onChange={(e) => setPartCategory(e.target.value)}
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary font-medium"
                >
                  <option value="Hardware">Hardware / Machinery</option>
                  <option value="Electrical">Electrical / PLC</option>
                  <option value="Sensors">Sensors & Relays</option>
                  <option value="Networking">Networking Cables</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Unit Price</label>
                <input 
                  type="text" 
                  value={partPrice}
                  onChange={(e) => setPartPrice(e.target.value)}
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Initial Stock Qty</label>
                <input 
                  type="number" 
                  value={partStock}
                  onChange={(e) => setPartStock(e.target.value)}
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Warehouse Location</label>
              <input 
                type="text" 
                value={partLocation}
                onChange={(e) => setPartLocation(e.target.value)}
                placeholder="Central Warehouse, Zone A"
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddPartModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs">
                Add to Inventory
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Purchase Order Modal */}
      <Dialog open={poModalOpen} onOpenChange={setPoModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" /> Create Restock Purchase Order
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Generate supplier PO for low-stock inventory replenishment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePOSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Supplier Name</label>
              <select className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary">
                <option>Siemens Industrial India Ltd</option>
                <option>Cisco Systems Enterprise</option>
                <option>Schneider Electric Global</option>
              </select>
            </div>

            <div className="p-3 bg-secondary/50 rounded-lg border border-border text-xs space-y-1">
              <p className="font-semibold text-foreground">Low Stock Restock Items ({lowStockParts.length}):</p>
              {lowStockParts.length === 0 ? (
                <p className="text-muted-foreground">All inventory items are currently above minimum stock levels.</p>
              ) : (
                lowStockParts.map(p => (
                  <p key={p.id} className="text-rose-400 flex items-center gap-1">• {p.name} (SKU: {p.sku}) - {p.stock} units remaining</p>
                ))
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPoModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Submit PO
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
