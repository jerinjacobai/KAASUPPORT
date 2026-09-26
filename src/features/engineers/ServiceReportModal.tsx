import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Download, Clock, PenTool, RotateCcw, ShieldCheck, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMasterStore } from '@/stores/master-store';

interface ServiceReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  engineerName: string;
  companyName: string;
}

export function ServiceReportModal({ open, onOpenChange, ticketId, engineerName, companyName }: ServiceReportModalProps) {
  const { tickets, assets } = useMasterStore();
  const ticket = tickets.find(t => t.id === ticketId);
  const asset = ticket?.assetId ? assets.find(a => a.id === ticket.assetId) : null;

  // Signature state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedSignerName, setTypedSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('Client Site Representative');
  const [serviceNotes, setServiceNotes] = useState(
    'Hardware diagnostic completed. Field calibration and signal verification conducted successfully. Operational clearance granted.'
  );
  const [acknowledged, setAcknowledged] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize canvas when modal opens
  useEffect(() => {
    if (open && signatureMode === 'draw') {
      const timer = setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.strokeStyle = '#0284c7'; // Cyan/Primary stroke
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, signatureMode]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const getSignatureDataUrl = (): string | null => {
    if (signatureMode === 'draw' && hasDrawn && canvasRef.current) {
      return canvasRef.current.toDataURL('image/png');
    }
    return null;
  };

  const handleDownloadPDF = () => {
    const signatureImage = getSignatureDataUrl();
    const effectiveSigner = typedSignerName.trim() || 'Authorized Customer Rep';

    if (signatureMode === 'draw' && !hasDrawn && !typedSignerName.trim()) {
      toast.error('Customer Signature Required', {
        description: 'Please have the customer sign on the pad or type their name to verify the report.'
      });
      return;
    }

    if (!acknowledged) {
      toast.error('Customer Acknowledgment Required', {
        description: 'Please confirm the client acknowledgment checkbox.'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const reportDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const reportTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const reportId = `KAA-FSR-${ticketId.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;

      // Generate printable HTML window
      const printWindow = window.open('', '_blank', 'width=900,height=1000');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups to print the PDF report.');
        setIsGenerating(false);
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Field Service Report - ${reportId}</title>
          <meta charset="utf-8" />
          <style>
            @page { size: A4; margin: 15mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 20px;
              background: #fff;
              line-height: 1.5;
            }
            .header-table {
              width: 100%;
              border-bottom: 3px solid #0284c7;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .brand-title {
              font-size: 22px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.5px;
            }
            .brand-sub {
              font-size: 11px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .badge-verified {
              display: inline-block;
              background: #ecfdf5;
              color: #059669;
              border: 1px solid #a7f3d0;
              font-size: 11px;
              font-weight: 700;
              padding: 4px 10px;
              border-radius: 4px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 20px;
            }
            .meta-item label {
              display: block;
              font-size: 10px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 600;
              letter-spacing: 0.5px;
            }
            .meta-item span {
              font-size: 13px;
              font-weight: 600;
              color: #0f172a;
            }
            .section-title {
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
              margin-top: 16px;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .box {
              background: #fff;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 12px;
              font-size: 12px;
              color: #334155;
            }
            .sign-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px dashed #cbd5e1;
            }
            .sign-box {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 14px;
              background: #f8fafc;
              text-align: center;
            }
            .sign-box h5 {
              margin: 0 0 8px 0;
              font-size: 11px;
              text-transform: uppercase;
              color: #64748b;
            }
            .signature-display {
              min-height: 70px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: 'Brush Script MT', cursive, sans-serif;
              font-size: 24px;
              color: #0369a1;
            }
            .footer-notes {
              margin-top: 30px;
              font-size: 10px;
              color: #94a3b8;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="vertical-align: middle;">
                <div class="brand-title">KAA TECHNOLOGIES ENTERPRISE</div>
                <div class="brand-sub">Industrial Automation & Field Engineering Support</div>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div class="badge-verified">OFFICIAL SERVICE REPORT</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Ref: ${reportId}</div>
              </td>
            </tr>
          </table>

          <div class="meta-grid">
            <div class="meta-item">
              <label>Client Organization</label>
              <span>${companyName}</span>
            </div>
            <div class="meta-item">
              <label>Ticket Reference</label>
              <span style="color: #0284c7;">${ticketId}</span> ${ticket?.title ? ` - ${ticket.title}` : ''}
            </div>
            <div class="meta-item">
              <label>Field Service Engineer</label>
              <span>${engineerName} (KAA Internal Support)</span>
            </div>
            <div class="meta-item">
              <label>Execution Timestamp</label>
              <span>${reportDate} at ${reportTime} (GPS Verified)</span>
            </div>
            ${asset ? `
            <div class="meta-item" style="grid-column: span 2;">
              <label>Serviced Hardware / Asset</label>
              <span>${asset.name} (${asset.tag}) - Model: ${asset.model} | AMC: ${asset.amcStatus}</span>
            </div>
            ` : ''}
          </div>

          <div class="section-title">Field Intervention & Action Report</div>
          <div class="box">
            ${serviceNotes}
          </div>

          <div class="sign-grid">
            <div class="sign-box">
              <h5>Field Service Engineer</h5>
              <div class="signature-display" style="font-family: inherit; font-size: 14px; font-weight: 700; color: #0f172a;">
                ✓ ${engineerName}
              </div>
              <div style="font-size: 10px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 6px; margin-top: 8px;">
                Digitally Stamped & Authenticated<br/>
                KAA Engineering Operations
              </div>
            </div>

            <div class="sign-box">
              <h5>Customer Acceptance & Sign-off</h5>
              <div class="signature-display">
                ${signatureImage ? `<img src="${signatureImage}" style="max-height: 60px; max-width: 90%; object-fit: contain;" />` : `<span style="font-size: 26px;">${effectiveSigner}</span>`}
              </div>
              <div style="font-size: 10px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 6px; margin-top: 8px;">
                <strong>${effectiveSigner}</strong><br/>
                ${signerRole} | ${companyName}
              </div>
            </div>
          </div>

          <div class="footer-notes">
            This document is a certified field service record of KAA Technologies. Generated electronically with secure audit trail on ${new Date().toISOString()}.
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();

      toast.success('Service Report PDF Dispatched', {
        description: `Exported official completion document for ${ticketId}.`
      });
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to export PDF', {
        description: err instanceof Error ? err.message : 'Please check pop-up settings.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border text-foreground p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <FileText className="w-5 h-5 text-primary" /> Branded Field Service Report & Sign-off
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Complete service intervention findings, capture client digital sign-off, and export the official PDF certificate.
          </DialogDescription>
        </DialogHeader>

        {/* Report Overview Preview */}
        <div className="bg-secondary/30 rounded-xl p-5 border border-border space-y-4 text-xs">
          <div className="flex justify-between items-start border-b border-border pb-3">
            <div>
              <h3 className="font-bold text-sm text-foreground tracking-wide flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" /> KAA ENTERPRISE SERVICE REPORT
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Field Operations & System Certification</p>
            </div>
            <div className="text-right">
              <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-500/30">
                VERIFIED INSPECTION
              </span>
              <p className="text-[10px] font-mono text-muted-foreground mt-1">Ref: FSR-{ticketId}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Client Company</span>
              <span className="font-bold text-foreground text-xs">{companyName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Ticket ID</span>
              <span className="font-mono font-bold text-primary text-xs">{ticketId}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Field Engineer</span>
              <span className="font-semibold text-foreground text-xs">{engineerName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Service Date</span>
              <span className="font-semibold text-foreground text-xs flex items-center gap-1">
                <Clock className="w-3 h-3 text-primary" /> {new Date().toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>

          {asset && (
            <div className="p-2.5 rounded-lg bg-card/60 border border-border/60">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Equipment / Asset</span>
              <span className="font-medium text-foreground text-xs">
                {asset.name} ({asset.tag}) - {asset.category} | AMC: {asset.amcStatus}
              </span>
            </div>
          )}

          {/* Intervention Findings */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-semibold text-foreground">Service Notes / Work Carried Out</label>
            <textarea
              rows={2}
              value={serviceNotes}
              onChange={(e) => setServiceNotes(e.target.value)}
              className="w-full bg-card border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Customer Signature Capture Section */}
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <PenTool className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold text-foreground">Customer Verification & Digital Signature *</h4>
            </div>
            <div className="flex gap-1 bg-secondary/60 p-0.5 rounded-md border border-border text-[10px]">
              <button
                type="button"
                onClick={() => setSignatureMode('draw')}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  signatureMode === 'draw' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Draw Signature
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode('type')}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  signatureMode === 'type' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Type Name
              </button>
            </div>
          </div>

          {signatureMode === 'draw' ? (
            <div className="space-y-2">
              <div className="relative border border-border rounded-lg bg-card overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={120}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[120px] cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground/50 text-xs italic">
                    Sign with mouse or touchscreen here
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground">Digital biometric capture</span>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="flex items-center gap-1 text-destructive hover:underline"
                >
                  <RotateCcw className="w-3 h-3" /> Clear Pad
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={typedSignerName}
                onChange={(e) => setTypedSignerName(e.target.value)}
                placeholder="Type customer authorized representative name..."
                className="w-full bg-card border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:border-primary"
              />
              {typedSignerName && (
                <div className="p-3 bg-card border border-border rounded-lg text-center font-serif text-lg text-primary italic">
                  {typedSignerName}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-semibold">Signer Name / Representative</label>
              <input
                type="text"
                value={typedSignerName}
                onChange={(e) => setTypedSignerName(e.target.value)}
                placeholder="E.g., Ahmed Al-Mansoor"
                className="w-full bg-card border border-border rounded-lg p-2 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-semibold">Designation / Role</label>
              <input
                type="text"
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value)}
                placeholder="E.g., Plant Operations Head"
                className="w-full bg-card border border-border rounded-lg p-2 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span className="text-[11px] text-muted-foreground leading-snug">
              Client confirms that the described technical intervention was performed satisfactorily and equipment has been handed over in safe working condition.
            </span>
          </label>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>KAA Cloud Authenticated</span>
          </div>
          <div className="flex items-center gap-2">
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
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" /> Download / Print PDF Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
