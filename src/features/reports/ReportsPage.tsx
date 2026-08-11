import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockChartData } from '@/lib/mock-data';
import { BarChart3, Filter, Calendar, FileSpreadsheet, FileText, Download, CheckCircle2, ShieldCheck, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';
import { useMasterStore } from '@/stores/master-store';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'monthly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState('Aug 2026');
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  const { tickets } = useMasterStore();

  const monthlyReportData = [
    { month: 'Aug 2026', totalTickets: tickets.length + 8, resolved: tickets.length + 6, slaPct: 98.4, amcVisits: 5, avgHours: '1.8 hrs' },
    { month: 'Jul 2026', totalTickets: 24, resolved: 23, slaPct: 96.5, amcVisits: 8, avgHours: '2.1 hrs' },
    { month: 'Jun 2026', totalTickets: 19, resolved: 19, slaPct: 99.0, amcVisits: 4, avgHours: '1.5 hrs' },
    { month: 'May 2026', totalTickets: 28, resolved: 27, slaPct: 95.8, amcVisits: 9, avgHours: '2.4 hrs' },
    { month: 'Apr 2026', totalTickets: 15, resolved: 15, slaPct: 100.0, amcVisits: 3, avgHours: '1.4 hrs' },
    { month: 'Mar 2026', totalTickets: 22, resolved: 21, slaPct: 97.2, amcVisits: 6, avgHours: '1.9 hrs' },
  ];

  const currentMonthMetrics = monthlyReportData.find(m => m.month === selectedMonth) || monthlyReportData[0];

  const handleExportExcel = () => {
    toast.success(`Monthly Report (${selectedMonth}) Exported to Excel`, {
      description: `Downloaded KAA_Monthly_Report_${selectedMonth.replace(' ', '_')}.xlsx`
    });
  };

  const handleExportPDF = () => {
    toast.success(`Executive Monthly PDF Report Generated (${selectedMonth})`, {
      description: `Downloaded KAA_Executive_Service_Report_${selectedMonth.replace(' ', '_')}.pdf`
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Service Analytics"
        description="Executive KPI insights, monthly SLA performance, engineer resolution metrics, and AMC report exports"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel} className="gap-2 text-xs">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Monthly Excel
          </Button>
          <Button variant="default" onClick={handleExportPDF} className="gap-2 text-xs">
            <FileText className="w-4 h-4" /> Export Executive PDF
          </Button>
        </div>
      </PageHeader>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="bg-secondary/40 p-1 border border-border rounded-xl">
          <TabsTrigger value="monthly" className="gap-2 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-primary" /> Monthly Reports & Audit
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-2 text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" /> Overall Service Desk Analytics
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Monthly Reports Option */}
        <TabsContent value="monthly" className="mt-4 space-y-6">
          
          {/* Month Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-secondary/30 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Select Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  toast.info(`Switched report to ${e.target.value}`);
                }}
                className="bg-card border border-border text-foreground rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-primary cursor-pointer"
              >
                {monthlyReportData.map(m => (
                  <option key={m.month} value={m.month}>{m.month} Monthly Summary</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 font-semibold gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> SLA Audited
              </Badge>
              <Button size="sm" variant="outline" onClick={handleExportPDF} className="text-xs gap-1">
                <Download className="w-3.5 h-3.5" /> Download Report PDF
              </Button>
            </div>
          </div>

          {/* Monthly KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass p-5 rounded-xl border border-border space-y-2 shadow-lg">
              <div className="flex justify-between items-center text-muted-foreground text-xs font-medium">
                <span>Total Tickets ({selectedMonth})</span>
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{currentMonthMetrics.totalTickets}</div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3 h-3" /> {currentMonthMetrics.resolved} tickets resolved
              </p>
            </div>

            <div className="glass p-5 rounded-xl border border-border space-y-2 shadow-lg">
              <div className="flex justify-between items-center text-muted-foreground text-xs font-medium">
                <span>Monthly SLA Compliance</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">{currentMonthMetrics.slaPct}%</div>
              <p className="text-[11px] text-muted-foreground">Target &ge; 90% SLA met</p>
            </div>

            <div className="glass p-5 rounded-xl border border-border space-y-2 shadow-lg">
              <div className="flex justify-between items-center text-muted-foreground text-xs font-medium">
                <span>Avg Resolution Time</span>
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-foreground">{currentMonthMetrics.avgHours}</div>
              <p className="text-[11px] text-muted-foreground">Turnaround time</p>
            </div>

            <div className="glass p-5 rounded-xl border border-border space-y-2 shadow-lg">
              <div className="flex justify-between items-center text-muted-foreground text-xs font-medium">
                <span>AMC Visits Quota Used</span>
                <Calendar className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400">{currentMonthMetrics.amcVisits} Visits</div>
              <p className="text-[11px] text-muted-foreground">Across active client AMCs</p>
            </div>
          </div>

          {/* Month-by-Month Summary Table */}
          <div className="glass rounded-xl p-6 border border-border space-y-4 shadow-lg">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Month-by-Month Historical Performance Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-secondary/80 border-b border-border text-muted-foreground font-semibold uppercase">
                  <tr>
                    <th className="p-3">Month</th>
                    <th className="p-3">Total Tickets</th>
                    <th className="p-3">Resolved</th>
                    <th className="p-3">SLA Compliance</th>
                    <th className="p-3">AMC Visits Used</th>
                    <th className="p-3">Avg Resolution Time</th>
                    <th className="p-3 text-right">Export</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {monthlyReportData.map((m) => (
                    <tr key={m.month} className={`hover:bg-secondary/30 transition-colors ${m.month === selectedMonth ? 'bg-primary/10 font-semibold' : ''}`}>
                      <td className="p-3 font-bold text-foreground flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> {m.month}
                      </td>
                      <td className="p-3 font-semibold text-foreground">{m.totalTickets}</td>
                      <td className="p-3 text-emerald-400 font-bold">{m.resolved}</td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">{m.slaPct}%</td>
                      <td className="p-3 font-semibold text-amber-400">{m.amcVisits} visits</td>
                      <td className="p-3 font-mono text-muted-foreground">{m.avgHours}</td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" onClick={handleExportPDF} className="text-[11px] gap-1 py-1 h-7">
                          <FileText className="w-3 h-3 text-primary" /> PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Overall Service Desk Analytics */}
        <TabsContent value="overview" className="mt-4 space-y-6">
          {/* Date & Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-secondary/30 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Date Range:</span>
              <div className="flex bg-background border border-border rounded-lg p-0.5 text-xs font-semibold">
                <button 
                  onClick={() => { setRange('7d'); toast.info('Filtering analytics for Last 7 Days'); }}
                  className={`px-3 py-1 rounded-md transition-colors ${range === '7d' ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  7 Days
                </button>
                <button 
                  onClick={() => { setRange('30d'); toast.info('Filtering analytics for Last 30 Days'); }}
                  className={`px-3 py-1 rounded-md transition-colors ${range === '30d' ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  30 Days
                </button>
                <button 
                  onClick={() => { setRange('90d'); toast.info('Filtering analytics for Last 90 Days'); }}
                  className={`px-3 py-1 rounded-md transition-colors ${range === '90d' ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
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
              <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
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
              <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
                <BarChart3 className="w-5 h-5 text-primary" /> Engineer Resolved Tickets & Performance
              </h3>
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyReportData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#a1a1aa" fontSize={12} />
                    <YAxis stroke="#a1a1aa" fontSize={12} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
                    <Bar dataKey="resolved" fill="#6366f1" radius={[4, 4, 0, 0]} name="Tickets Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
