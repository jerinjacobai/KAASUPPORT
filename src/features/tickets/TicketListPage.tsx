import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { mockTickets } from '@/lib/mock-data';
import { Plus, Search, Filter, SlidersHorizontal, Download, MoreHorizontal, Lock, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/stores/auth-store';
import { Badge } from '@/components/ui/badge';

export default function TicketListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { isKaaInternal, userCompany } = useAuthStore();

  // Multi-tenant Row-Level Security Filtering
  const filteredTickets = mockTickets.filter(ticket => {
    const matchesTenant = isKaaInternal ? true : (ticket.company === userCompany);
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.assignee.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTenant && matchesSearch;
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader 
        title={isKaaInternal ? "Support Tickets (All Clients)" : `My Tickets (${userCompany})`} 
        description={isKaaInternal ? "Manage and track customer support requests across all KAA client companies." : `Track status, field engineer visits, and updates for ${userCompany} tickets.`}
      >
        <Link 
          to="/tickets/new" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Raise Ticket
        </Link>
      </PageHeader>

      <div className="glass rounded-xl border border-border flex flex-col flex-1 min-h-0 overflow-hidden animate-slide-in-up">
        
        {/* Toolbar & RLS Status Header */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-secondary/10">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative group w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by ID, title, or assignee..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 pl-9 pr-4 text-sm outline-none transition-all"
              />
            </div>
            <button className="p-2 border border-border rounded-lg bg-background hover:bg-secondary text-muted-foreground transition-colors hidden sm:block">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {!isKaaInternal && (
              <Badge variant="outline" className="text-xs py-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold gap-1">
                <Lock className="w-3 h-3" /> Mapped to {userCompany} Only
              </Badge>
            )}
            
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-md whitespace-nowrap">
              <Filter className="w-3.5 h-3.5" /> Status: All
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground hover:bg-secondary text-xs font-medium rounded-md whitespace-nowrap transition-colors">
              Priority: All
            </button>
            <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
            <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors hidden sm:block" title="Export">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0 bg-secondary/80 backdrop-blur border-b border-border z-10 text-xs font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="p-4 w-10">
                  <input type="checkbox" className="rounded border-border" />
                </th>
                <th className="p-4">Ticket ID</th>
                <th className="p-4">Title</th>
                {isKaaInternal && <th className="p-4">Client Company</th>}
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Assignee</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-secondary/30 transition-colors group">
                  <td className="p-4">
                    <input type="checkbox" className="rounded border-border" />
                  </td>
                  <td className="p-4 font-mono font-medium text-primary">
                    <Link to={`/tickets/${ticket.id}`} className="hover:underline flex items-center gap-1">
                      {ticket.id}
                      {ticket.slaBreached && (
                        <span className="w-2 h-2 rounded-full bg-destructive animate-ping" title="SLA Breached" />
                      )}
                    </Link>
                  </td>
                  <td className="p-4 max-w-md font-medium text-foreground">
                    <Link to={`/tickets/${ticket.id}`} className="hover:text-primary transition-colors block truncate">
                      {ticket.title}
                    </Link>
                  </td>
                  {isKaaInternal && (
                    <td className="p-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-primary" /> {ticket.company}
                      </span>
                    </td>
                  )}
                  <td className="p-4">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="p-4">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <img src={ticket.assignee.avatar} alt={ticket.assignee.name} className="w-6 h-6 rounded-full border border-border" />
                      <span className="text-xs text-foreground font-medium">{ticket.assignee.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={isKaaInternal ? 9 : 8} className="p-8 text-center text-muted-foreground">
                    No tickets found matching your scope or search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-secondary/10">
          <span>Showing {filteredTickets.length} tickets</span>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded border border-border bg-background hover:bg-secondary disabled:opacity-50" disabled>Previous</button>
            <button className="px-2.5 py-1 rounded border border-border bg-background hover:bg-secondary disabled:opacity-50" disabled>Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}
