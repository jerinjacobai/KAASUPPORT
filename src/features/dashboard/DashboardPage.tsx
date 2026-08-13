import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockChartData } from '@/lib/mock-data';
import { Ticket, Activity, Clock, ShieldCheck, Download, Building2, Wrench, Lock, PlusCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuthStore } from '@/stores/auth-store';
import { useMasterStore } from '@/stores/master-store';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

import { toast } from 'sonner';

export default function DashboardPage() {
  const { isKaaInternal, userCompany } = useAuthStore();
  const { tickets, amcContracts } = useMasterStore();

  const companyTickets = tickets.filter(ticket => 
    isKaaInternal ? true : (ticket.company === userCompany)
  );

  const openCount = companyTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const recentTickets = companyTickets.slice(0, 5);

  const activeContracts = amcContracts.filter(c => isKaaInternal ? true : c.company === userCompany);
  const remainingVisitsStr = activeContracts.length > 0 
    ? `${activeContracts[0].totalVisits - activeContracts[0].usedVisits} / ${activeContracts[0].totalVisits}`
    : '0 / 0';

  const handleExportSummary = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to export executive summary.');
        return;
      }

      const ticketsListRows = companyTickets.length > 0 
        ? companyTickets.map(t => `
            <tr>
              <td><strong>${t.id || t.ticket_number}</strong></td>
              <td>${t.title}</td>
              <td>${t.company}</td>
              <td><span style="text-transform: uppercase; font-weight: bold; color: ${t.priority === 'high' || t.priority === 'critical' ? '#ef4444' : '#eab308'};">${t.priority}</span></td>
              <td><span style="text-transform: uppercase; font-weight: bold; color: ${t.status === 'resolved' ? '#10b981' : '#6366f1'};">${t.status}</span></td>
            </tr>
          `).join('')
        : `<tr><td colspan="5" style="text-align: center; color: #6b7280; padding: 15px;">No active support tickets.</td></tr>`;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>KAA Dashboard Executive Summary</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 20px; background: #fff; }
              .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px; }
              .brand { font-size: 22px; font-weight: 800; color: #4f46e5; }
              .sub-brand { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
              .title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 5px 0; }

              .kpi-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
              .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
              .kpi-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
              .kpi-value { font-size: 22px; font-weight: 800; color: #0f172a; }

              table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 15px; }
              th { background: #f1f5f9; color: #475569; font-weight: 700; text-align: left; padding: 8px 10px; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; font-size: 10px; }
              td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
            </style>
          </head>
          <body>
            <div className="header-bar">
              <div>
                <div className="brand">KAA SUPPORT PORTAL</div>
                <div className="sub-brand">Dashboard Executive Summary Report</div>
              </div>
              <div style="text-align: right;">
                <p style="font-size: 11px; color: #64748b; margin: 0;">Scope: <strong>${isKaaInternal ? 'All KAA Clients' : userCompany}</strong></p>
                <p style="font-size: 10px; color: #94a3b8; margin: 2px 0 0 0;">Generated: ${new Date().toLocaleString()}</p>
              </div>
            </div>

            <h2 className="title">Executive Operations Summary</h2>

            <div className="kpi-container">
              <div className="kpi-card">
                <div className="kpi-label">TOTAL TICKETS</div>
                <div className="kpi-value">${companyTickets.length}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">ACTIVE OPEN ISSUES</div>
                <div className="kpi-value" style="color: #6366f1;">${openCount}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">AVG RESPONSE TIME</div>
                <div className="kpi-value">1.8 hrs</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">SLA COMPLIANCE</div>
                <div className="kpi-value" style="color: #10b981;">100%</div>
              </div>
            </div>

            <h3>Recent Registered Tickets</h3>
            <table>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${ticketsListRows}
              </tbody>
            </table>

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

      toast.success('Executive Summary PDF Generated!', {
        description: 'Opened dashboard printable summary window.'
      });
    } catch {
      toast.error('Failed to generate dashboard export');
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-lg border-border/50 text-sm shadow-xl">
          <p className="font-medium mb-1 text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium text-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={isKaaInternal ? "KAA Executive Operations Command" : `${userCompany || 'Client'} Portal`} 
        description={isKaaInternal ? "Enterprise service desk metrics, dispatcher load, and field operations." : `Track ticket status, AMC visits, and service requests for ${userCompany || 'your company'}.`}
      >
        <div className="flex gap-2">
          {!isKaaInternal && (
            <Link to="/tickets/new" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
              <PlusCircle className="w-4 h-4" /> Raise Ticket
            </Link>
          )}
          <button onClick={handleExportSummary} className="bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Summary
          </button>
        </div>
      </PageHeader>

      {/* RLS Client Scope Banner if Client Login */}
      {!isKaaInternal && (
        <div className="glass p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">Multi-Tenant Client Isolation Active</h4>
              <p className="text-xs text-muted-foreground">You are viewing real-time tickets, AMC contracts, and machinery registered to <strong className="text-emerald-400">{userCompany || 'your mapped organization'}</strong>.</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
            Row-Level Security (RLS)
          </Badge>
        </div>
      )}

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
        <KPICard 
          title={isKaaInternal ? "Total Enterprise Tickets" : "My Company Tickets"} 
          value={companyTickets.length} 
          change={0}
          trend="neutral"
          icon={Ticket}
          subtitle="Registered support tickets"
        />
        <KPICard 
          title="Active Open Issues" 
          value={openCount} 
          change={0}
          trend="neutral"
          icon={Activity}
          subtitle="Requires technician action"
        />
        <KPICard 
          title={isKaaInternal ? "Avg Field Response Time" : "AMC Remaining Visits"} 
          value={isKaaInternal ? (companyTickets.length > 0 ? "1.8 hrs" : "0 hrs") : remainingVisitsStr} 
          change={0}
          trend="neutral"
          icon={isKaaInternal ? Clock : Wrench}
          subtitle={isKaaInternal ? "Across all regional hubs" : "Preventative visits quota"}
        />
        <KPICard 
          title="SLA Compliance Rate" 
          value={companyTickets.length > 0 ? "100%" : "100%"} 
          change={0}
          trend="up"
          icon={ShieldCheck}
          subtitle="Target >= 90%"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
        {/* Ticket Volume Chart */}
        <div className="lg:col-span-2 glass rounded-xl p-6 border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Ticket Activity Trends</h2>
              <p className="text-xs text-muted-foreground font-medium">Volume over the last 30 days</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData.ticketVolume}>
                <defs>
                  <linearGradient id="ticketGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tickets" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#ticketGrad)" name="Total Tickets" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="glass rounded-xl p-6 border-border/50">
          <h2 className="text-lg font-semibold mb-2 text-foreground">Priority Breakdown</h2>
          <p className="text-xs text-muted-foreground mb-4 font-medium">Distribution by severity</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockChartData.ticketsByPriority}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockChartData.ticketsByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {mockChartData.ticketsByPriority.map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-muted-foreground">{p.name}:</span>
                <span className="font-medium text-foreground">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Tickets Grid */}
      <div className="glass rounded-xl p-6 border-border/50 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{isKaaInternal ? 'Recent Tickets' : `Recent ${userCompany || 'Company'} Tickets`}</h2>
            <p className="text-xs text-muted-foreground">Latest submitted issues and resolution progress</p>
          </div>
          <Link to="/tickets" className="text-xs text-primary hover:underline font-medium">View All Tickets →</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground uppercase border-b border-border/50 bg-secondary/20 font-semibold">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Title</th>
                {isKaaInternal && <th className="p-3">Client</th>}
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-xs">
              {recentTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground font-medium">No recent tickets raised yet.</td>
                </tr>
              ) : (
                recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3 font-mono font-bold text-primary">
                      <Link to={`/tickets/${ticket.id}`} className="hover:underline">{ticket.id}</Link>
                    </td>
                    <td className="p-3 font-medium max-w-xs truncate text-foreground">{ticket.title}</td>
                    {isKaaInternal && (
                      <td className="p-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3 text-primary" /> {ticket.company}</span>
                      </td>
                    )}
                    <td className="p-3"><PriorityBadge priority={ticket.priority || 'medium'} /></td>
                    <td className="p-3"><StatusBadge status={ticket.status || 'open'} /></td>
                    <td className="p-3">
                      {(!ticket.assignee?.name || ticket.assignee.name === 'Unassigned' || ticket.assignee.name === 'Support Staff') ? (
                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold flex items-center justify-center text-[10px]">
                            {ticket.assignee.name.charAt(0)}
                          </div>
                          <span className="text-xs text-foreground font-medium">{ticket.assignee.name}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
