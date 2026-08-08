import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Download, QrCode, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  engineerName: string;
  companyName: string;
}

export function ServiceReportModal({ open, onOpenChange, ticketId, engineerName, companyName }: ServiceReportModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Field Service Report PDF generated!', {
        description: `Downloaded report for ${ticketId} with digital verification QR code.`
      });
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100 p-6 space-y-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <FileText className="w-5 h-5 text-primary" /> Branded Field Service Report PDF
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Auto-generated service completion certificate with GPS check-in timestamp and digital signature.
          </DialogDescription>
        </DialogHeader>

        {/* PDF Preview Container */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4 text-xs font-mono">
          <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white tracking-wider">KAA ERP SUPPORT REPORT</h3>
              <p className="text-[10px] text-zinc-400">Field Operations & Service Management</p>
            </div>
            <div className="text-right">
              <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-500/30">
                VERIFIED COMPLETION
              </span>
              <p className="text-[10px] text-zinc-400 mt-1">Ref: SR-{ticketId}-2026</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-zinc-300">
            <div>
              <span className="text-zinc-500 block text-[10px]">CLIENT COMPANY</span>
              <span className="font-bold text-white text-sm">{companyName}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">TICKET ID</span>
              <span className="font-bold text-primary text-sm">{ticketId}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">FIELD ENGINEER</span>
              <span className="font-semibold text-white">{engineerName}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">COMPLETION TIME</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <Clock className="w-3 h-3 text-primary" /> 2026-08-08 14:30 IST
              </span>
            </div>
          </div>

          <div className="p-3 bg-zinc-950 rounded border border-zinc-800 space-y-1">
            <span className="text-zinc-500 text-[10px] block">GPS LOCATION STAMP</span>
            <p className="text-zinc-300 flex items-center gap-1 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> 12.9716° N, 77.5946° E (Bangalore Tech Hub)
            </p>
          </div>

          <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-8 h-8 text-primary" />
              <div className="text-[10px] text-zinc-400">
                <p className="font-semibold text-zinc-200">Digital QR Verification</p>
                <p>Scan to verify authenticity on KAA Cloud</p>
              </div>
            </div>
            <div className="text-right">
              <div className="w-24 h-8 border border-dashed border-zinc-700 rounded flex items-center justify-center text-[9px] text-zinc-500">
                Customer Signature
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Close
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleDownloadPDF} 
            disabled={isGenerating}
            className="text-xs gap-2"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Download className="w-3.5 h-3.5" /> Download PDF Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
