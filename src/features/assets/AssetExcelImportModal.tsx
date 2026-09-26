import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Download, Upload, CheckCircle2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMasterStore } from '@/stores/master-store';

export interface AssetExcelImportModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface ParsedAssetRow {
  tag: string;
  name: string;
  company: string;
  hardwareType: string;
  model: string;
  serial: string;
  status: string;
  amcStatus: string;
  warrantyExpires: string;
  assetUser: string;
  remarks: string;
  isValid: boolean;
  errorMessage?: string;
}

export function AssetExcelImportModal({ open, onOpenChange, isOpen, onClose }: AssetExcelImportModalProps) {
  const isModalOpen = open !== undefined ? open : !!isOpen;
  const handleModalChange = (state: boolean) => {
    if (onOpenChange) onOpenChange(state);
    if (!state && onClose) onClose();
  };

  const { companies, addAsset } = useMasterStore();
  const activeCompanies = companies.filter(c => c.is_active);

  const [parsedRows, setParsedRows] = useState<ParsedAssetRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    try {
      const defaultCompany = activeCompanies[0]?.name || 'International Technical Legacy';
      const headers = [
        'Asset Tag',
        'Equipment Name',
        'Client Company',
        'Hardware Type',
        'Model',
        'Serial Number',
        'Status',
        'AMC Status',
        'Warranty Expiry',
        'Asset User',
        'Remarks'
      ];

      const sampleData = [
        [
          'AST-2026-101',
          'Siemens S7-1500 PLC Rack',
          defaultCompany,
          'PLC / Controller',
          'CPU 1518-4 PN/DP',
          'SN-882194',
          'Active',
          'Active AMC',
          '2027-12-31',
          'Line 1 Operator',
          'Main automation controller'
        ],
        [
          'AST-2026-102',
          'ABB ACS880 Industrial Drive',
          defaultCompany,
          'VFD / Motor Drive',
          'ACS880-01-045A-3',
          'SN-774912',
          'Active',
          'Active AMC',
          '2028-06-30',
          'Plant Maintenance',
          'Packaging line primary motor drive'
        ],
        [
          'AST-2026-103',
          'Dell PowerEdge R750 Server',
          defaultCompany,
          'Server / Rack',
          'PowerEdge R750',
          'SN-554109',
          'Active',
          'Active AMC',
          '2027-09-15',
          'IT Department',
          'SCADA Historian server'
        ]
      ];

      const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
      ws['!cols'] = [
        { wch: 15 },
        { wch: 28 },
        { wch: 30 },
        { wch: 22 },
        { wch: 20 },
        { wch: 16 },
        { wch: 12 },
        { wch: 14 },
        { wch: 16 },
        { wch: 20 },
        { wch: 30 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Asset_Import_Template');
      XLSX.writeFile(wb, 'kaa_assets_import_template.xlsx');

      toast.success('Sample Excel template downloaded!', {
        description: 'Fill in your machinery & hardware assets and upload the file.'
      });
    } catch {
      toast.error('Could not generate sample template.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          toast.error('The selected Excel file is empty.');
          setIsProcessing(false);
          return;
        }

        const fallbackCompany = activeCompanies[0]?.name || 'KAA Client';

        const parsed: ParsedAssetRow[] = rawJson.map((row: any, idx: number) => {
          // Normalize column keys
          const keys = Object.keys(row);
          const getVal = (patterns: string[]) => {
            for (const p of patterns) {
              const matchedKey = keys.find(k => k.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === p.toLowerCase().replace(/[^a-z0-9]/g, ''));
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
                return String(row[matchedKey]).trim();
              }
            }
            return '';
          };

          const name = getVal(['equipmentname', 'equipment', 'assetname', 'name', 'asset', 'machinery']);
          const tag = getVal(['assettag', 'tag', 'assetid', 'assetcode', 'tagcode']) || `AST-2026-${Math.floor(100 + Math.random() * 900)}`;
          let rawCompany = getVal(['clientcompany', 'company', 'organization', 'client', 'tenant']);
          const hardwareType = getVal(['hardwaretype', 'type', 'category', 'assetcategory']) || 'Machinery';
          const model = getVal(['model', 'specifications', 'specs']) || 'Standard Unit';
          const serial = getVal(['serialnumber', 'serial', 'sn', 'serialno']) || `SN-${Math.floor(100000 + Math.random() * 900000)}`;
          const status = getVal(['status']) || 'Active';
          const amcStatus = getVal(['amcstatus', 'amc']) || 'Active AMC';
          const warrantyExpires = getVal(['warrantyexpiry', 'warrantyexpires', 'warranty', 'expiry']) || '2027-12-31';
          const assetUser = getVal(['assetuser', 'user', 'assigneduser', 'operator']) || '';
          const remarks = getVal(['remarks', 'notes', 'description']) || '';

          // Validate or match company
          let company = rawCompany;
          let isValid = true;
          let errorMessage = '';

          if (!name) {
            isValid = false;
            errorMessage = 'Equipment Name is missing.';
          }

          if (!company) {
            company = fallbackCompany;
          } else {
            const matched = activeCompanies.find(c => 
              c.name.toLowerCase() === company.toLowerCase() || 
              c.code.toLowerCase() === company.toLowerCase()
            );
            if (matched) {
              company = matched.name;
            } else if (activeCompanies.length > 0) {
              company = activeCompanies[0].name;
            }
          }

          return {
            tag,
            name: name || `Imported Asset #${idx + 1}`,
            company,
            hardwareType,
            model,
            serial,
            status,
            amcStatus,
            warrantyExpires,
            assetUser,
            remarks,
            isValid,
            errorMessage
          };
        });

        setParsedRows(parsed);
        const validCount = parsed.filter(r => r.isValid).length;
        toast.success(`Parsed ${parsed.length} rows from ${file.name}`, {
          description: `${validCount} valid asset records ready for import.`
        });
      } catch (err: any) {
        toast.error('Failed to parse Excel file', { description: err?.message || 'Please check the file format.' });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      toast.error('No valid asset rows to import.');
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;

    for (const row of validRows) {
      try {
        await addAsset({
          tag: row.tag,
          name: row.name,
          company: row.company,
          hardwareType: row.hardwareType,
          category: row.hardwareType,
          model: row.model,
          serial: row.serial,
          status: row.status,
          amcStatus: row.amcStatus,
          warrantyExpires: row.warrantyExpires,
          assetUser: row.assetUser,
          remarks: row.remarks
        });
        successCount++;
      } catch (err) {
        console.warn(`Failed to import asset ${row.tag}:`, err);
        failCount++;
      }
    }

    setIsImporting(false);
    toast.success(`Import complete! ${successCount} assets added.`, {
      description: failCount > 0 ? `${failCount} records failed due to database conflicts.` : 'All rows successfully registered.'
    });

    handleModalChange(false);
    setParsedRows([]);
    setFileName('');
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleModalChange}>
      <DialogContent className="max-w-4xl bg-card border-border text-card-foreground p-6 space-y-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Bulk Import Assets via Excel / CSV
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Quickly onboard multiple machinery units, servers, controllers, and laptops using an Excel spreadsheet.
          </DialogDescription>
        </DialogHeader>

        {/* Action Header: Download Template & File Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-secondary/30 rounded-xl border border-border flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Download className="w-4 h-4 text-primary" /> Step 1: Download Standard Template
              </h4>
              <p className="text-[11px] text-muted-foreground mt-1">
                Get a pre-formatted Excel template with sample equipment columns (Tag, Hardware Type, Model, Serial #).
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="w-full text-xs gap-2">
              <Download className="w-3.5 h-3.5" /> Download Excel Template (.xlsx)
            </Button>
          </div>

          <div className="p-4 bg-secondary/30 rounded-xl border border-border flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-400" /> Step 2: Upload Filled File
              </h4>
              <p className="text-[11px] text-muted-foreground mt-1">
                Select your completed Excel (.xlsx, .xls) or CSV file for automatic parsing and validation.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isProcessing}
                className="w-full text-xs gap-2"
              >
                <Upload className="w-3.5 h-3.5" /> {fileName ? `Re-upload (${fileName})` : 'Choose Excel / CSV File'}
              </Button>
            </div>
          </div>
        </div>

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                Preview Parsed Rows ({parsedRows.length} found, {parsedRows.filter(r => r.isValid).length} ready)
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setParsedRows([]); setFileName(''); }} 
                className="text-[11px] text-destructive h-7 gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear Table
              </Button>
            </div>

            <div className="max-h-64 overflow-y-auto border border-border rounded-lg bg-secondary/20">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-secondary/70 border-b border-border sticky top-0 text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-2.5">Tag</th>
                    <th className="p-2.5">Equipment Name</th>
                    <th className="p-2.5">Hardware Type</th>
                    <th className="p-2.5">Client Company</th>
                    <th className="p-2.5">Model / Serial #</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className={row.isValid ? 'hover:bg-secondary/40' : 'bg-destructive/10'}>
                      <td className="p-2.5 font-mono font-bold text-primary">{row.tag}</td>
                      <td className="p-2.5 font-semibold text-foreground">
                        {row.name}
                        {row.errorMessage && <span className="block text-[10px] text-destructive">{row.errorMessage}</span>}
                      </td>
                      <td className="p-2.5">
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                          {row.hardwareType}
                        </Badge>
                      </td>
                      <td className="p-2.5 font-medium text-emerald-400">{row.company}</td>
                      <td className="p-2.5 font-mono text-muted-foreground">{row.model} ({row.serial})</td>
                      <td className="p-2.5">
                        <Badge variant={row.isValid ? 'success' : 'destructive'} className="text-[10px]">
                          {row.isValid ? 'Ready' : 'Error'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={() => handleModalChange(false)} className="text-xs">
            Cancel
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleConfirmImport}
            disabled={isImporting || parsedRows.filter(r => r.isValid).length === 0}
            className="text-xs gap-2"
          >
            {isImporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Import {parsedRows.filter(r => r.isValid).length} Assets into Database
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
