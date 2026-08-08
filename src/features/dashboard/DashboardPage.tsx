import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockStats, mockChartData, mockTickets } from '@/lib/mock-data';
import { Ticket, Activity, Clock, ShieldCheck, Download, Building2, Wrench, Lock, PlusCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuthStore } from '@/stores/auth-store';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { isKaaInternal, userCompany } = useAuthStore();

  const recentTickets = mockTickets.filter(ticket => 
    isKaaInternal ? true : (ticket.company === userCompany)
  ).slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-lg border-border/50 text-sm shadow-xl">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{entry.value}</span>
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
        title={isKaaInternal ? "KAA Executive Operations Command" : `${userCompany} Client Portal`} 
        description={isKaaInternal ? "Enterprise service desk metrics, dispatcher load, and field operations." : `Track ticket status, AMC visits, and service requests for ${userCompany}.`}
      >
        <div className="flex gap-2">
          {!isKaaInternal && (
            <Link to="/tickets/new" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
              <PlusCircle className="w-4 h-4" /> Raise Ticket
            </Link>
          )}
          <button className="bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Report
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
              <p className="text-xs text-muted-foreground">You are viewing real-time tickets, AMC contracts, and machinery registered to <strong className="text-emerald-400">{userCompany}</strong>.</p>
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
          value={isKaaInternal ? mockStats.totalTickets.value : 14} 
          change={mockStats.totalTickets.change}
          trend={mockStats.totalTickets.trend as any}
          icon={Ticket}
          subtitle="In the last 30 days"
        />
        <KPICard 
          title="Active Open Issues" 
          value={isKaaInternal ? mockStats.openTickets.value : 3} 
          change={mockStats.openTickets.change}
          trend={mockStats.openTickets.trend as any}
          icon={Activity}
          subtitle="Requires action"
        />
        <KPICard 
          title={isKaaInternal ? "Avg Field Response Time" : "AMC Remaining Visits"} 
          value={isKaaInternal ? mockStats.avgResponseTime.value : "8 / 12"} 
          change={isKaaInternal ? mockStats.avgResponseTime.change : undefined}
          trend="down"
          icon={isKaaInternal ? Clock : Wrench}
          subtitle={isKaaInternal ? "Across all regional hubs" : "4 visits completed"}
        />
        <KPICard 
          title="SLA Compliance Rate" 
          value={`${mockStats.slaCompliance.value}%`} 
          change={mockStats.slaCompliance.change}
          trend={mockStats.slaCompliance.trend as any}
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
              <h2 className="text-lg font-semibold">Ticket Activity Trends</h2>
              <p className="text-xs text-muted-foreground">Volume over the last 30 days</p>
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
          <h2 className="text-lg font-semibold mb-2">Priority Breakdown</h2>
          <p className="text-xs text-muted-foreground mb-4">Distribution by severity</p>
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
            <h2 className="text-lg font-semibold">{isKaaInternal ? 'Recent Tickets' : `Recent ${userCompany} Tickets`}</h2>
            <p className="text-xs text-muted-foreground">Latest submitted issues and resolution progress</p>
          </div>
          <Link to="/tickets" className="text-xs text-primary hover:underline font-medium">View All Tickets →</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground uppercase border-b border-border/50 bg-secondary/20">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Title</th>
                {isKaaInternal && <th className="p-3">Client</th>}
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {recentTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-3 font-mono font-medium text-primary">
                    <Link to={`/tickets/${ticket.id}`} className="hover:underline">{ticket.id}</Link>
                  </td>
                  <td className="p-3 font-medium max-w-xs truncate">{ticket.title}</td>
                  {isKaaInternal && (
                    <td className="p-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3 text-primary" /> {ticket.company}</span>
                    </td>
                  )}
                  <td className="p-3"><PriorityBadge priority={ticket.priority} /></td>
                  <td className="p-3"><StatusBadge status={ticket.status} /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img src={ticket.assignee.avatar} alt="" className="w-5 h-5 rounded-full" />
                      <span className="text-xs">{ticket.assignee.name}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
