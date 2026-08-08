import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockStats, mockChartData, mockTickets } from '@/lib/mock-data';
import { Ticket, Activity, Clock, ShieldCheck, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export default function DashboardPage() {
  
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
        title="Dashboard Overview" 
        description="Monitor key performance indicators and ticket volumes."
      >
        <button className="bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </PageHeader>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
        <KPICard 
          title="Total Tickets" 
          value={mockStats.totalTickets.value} 
          change={mockStats.totalTickets.change}
          trend={mockStats.totalTickets.trend as any}
          icon={Ticket}
          subtitle="In the last 30 days"
        />
        <KPICard 
          title="Open Tickets" 
          value={mockStats.openTickets.value} 
          change={mockStats.openTickets.change}
          trend={mockStats.openTickets.trend as any}
          icon={Activity}
          subtitle={`${mockStats.openTickets.breakdown.critical} critical, ${mockStats.openTickets.breakdown.high} high priority`}
        />
        <KPICard 
          title="Avg Response Time" 
          value={mockStats.avgResponseTime.value} 
          change={mockStats.avgResponseTime.change}
          trend={mockStats.avgResponseTime.trend as any}
          icon={Clock}
          subtitle="Target: < 2.0 hrs"
        />
        <KPICard 
          title="SLA Compliance" 
          value={`${mockStats.slaCompliance.value}%`} 
          change={mockStats.slaCompliance.change}
          trend={mockStats.slaCompliance.trend as any}
          icon={ShieldCheck}
          subtitle="Target: > 95%"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
        
        <div className="glass rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Ticket Volume</h3>
            <select className="bg-secondary border-none text-xs rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData.ticketVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tickets" name="New Tickets" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorTickets)" />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-xl p-6 flex flex-col">
          <h3 className="font-semibold mb-6">Tickets by Priority</h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockChartData.ticketsByPriority}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {mockChartData.ticketsByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
              <span className="text-3xl font-bold">{mockStats.openTickets.value}</span>
              <span className="text-xs text-muted-foreground">Open</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {mockChartData.ticketsByPriority.map(item => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-medium ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mixed Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
        
        <div className="glass rounded-xl p-6 xl:col-span-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Tickets</h3>
            <button className="text-sm text-primary hover:underline font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase border-b border-border/50 bg-secondary/20">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">ID</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Assignee</th>
                  <th className="px-4 py-3 font-medium rounded-tr-lg">Created</th>
                </tr>
              </thead>
              <tbody>
                {mockTickets.slice(0, 5).map((ticket) => (
                  <tr key={ticket.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-primary whitespace-nowrap">{ticket.id}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{ticket.title}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={ticket.assignee.avatar} alt="" className="w-6 h-6 rounded-full border border-border" />
                        <span className="truncate max-w-[100px]">{ticket.assignee.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-6">Engineer Performance</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData.engineerPerformance} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.5} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--foreground)' }} width={80} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="resolved" name="Tickets Resolved" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
