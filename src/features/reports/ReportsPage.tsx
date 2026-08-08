import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockChartData } from '@/lib/mock-data';
import { BarChart3, Filter, Calendar, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';

export default function ReportsPage() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  const handleExportExcel = () => {
    toast.success('Analytics Report Exported to Excel', {
      description: 'Downloaded KAA_Service_Metrics_30D.xlsx'
    });
  };

  const handleExportPDF = () => {
    toast.success('Executive PDF Report Generated', {
      description: 'Downloaded KAA_Executive_Service_Report.pdf'
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Service Analytics"
        description="Executive KPI insights, SLA compliance, engineer performance, and billable service hours"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel} className="gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Excel
          </Button>
          <Button variant="default" onClick={handleExportPDF} className="gap-2">
            <FileText className="w-4 h-4" /> Export Executive PDF
          </Button>
        </div>
      </PageHeader>

      {/* Date & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-secondary/30 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Date Range:</span>
          <div className="flex bg-background border border-border rounded-lg p-0.5 text-xs font-semibold">
            <button 
              onClick={() => setRange('7d')}
              className={`px-3 py-1 rounded-md transition-colors ${range === '7d' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              7 Days
            </button>
            <button 
              onClick={() => setRange('30d')}
              className={`px-3 py-1 rounded-md transition-colors ${range === '30d' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              30 Days
            </button>
            <button 
              onClick={() => setRange('90d')}
              className={`px-3 py-1 rounded-md transition-colors ${range === '90d' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              90 Days
            </button>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => toast.info('Filters Applied', { description: 'Filtered by regional hub and client company.' })} className="text-xs gap-1">
          <Filter className="w-3.5 h-3.5" /> Advanced Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Compliance Over Time */}
        <div className="glass rounded-xl p-6 border border-border space-y-4 shadow-lg">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Response vs Resolution SLA Compliance (%)
          </h3>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData.slaPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} domain={[70, 100]} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="responseSla" stroke="#6366f1" strokeWidth={2} name="Response SLA" />
                <Line type="monotone" dataKey="resolutionSla" stroke="#10b981" strokeWidth={2} name="Resolution SLA" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engineer Resolution Metrics */}
        <div className="glass rounded-xl p-6 border border-border space-y-4 shadow-lg">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Engineer Resolved Tickets & CSAT
          </h3>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData.engineerPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
                <Bar dataKey="resolved" fill="#6366f1" radius={[4, 4, 0, 0]} name="Tickets Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
