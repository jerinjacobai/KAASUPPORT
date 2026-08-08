import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { mockTickets } from '@/lib/mock-data';
import { Plus, Search, Filter, SlidersHorizontal, Download, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TicketListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader 
        title="Tickets" 
        description="Manage and track customer support requests."
      >
        <Link 
          to="/tickets/new" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> New Ticket
        </Link>
      </PageHeader>

      <div className="glass rounded-xl border border-border flex flex-col flex-1 min-h-0 overflow-hidden animate-slide-in-up">
        
        {/* Toolbar */}
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
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-md whitespace-nowrap">
              <Filter className="w-3.5 h-3.5" /> Status: All
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground hover:bg-secondary text-xs font-medium rounded-md whitespace-nowrap transition-colors">
              Priority: All
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground hover:bg-secondary text-xs font-medium rounded-md whitespace-nowrap transition-colors">
              Company: All
            </button>
            <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
            <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors hidden sm:block" title="Export">
              <Download className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Table wrapper */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-muted-foreground uppercase bg-background sticky top-0 z-10 border-b border-border shadow-sm">
              <tr>
                <th className="px-4 py-3 font-medium w-10">
                  <input type="checkbox" className="rounded border-border text-primary focus:ring-primary bg-secondary/50 w-4 h-4" />
                </th>
                <th className="px-4 py-3 font-medium cursor-pointer hover:text-foreground">Ticket ID</th>
                <th className="px-4 py-3 font-medium cursor-pointer hover:text-foreground">Details</th>
                <th className="px-4 py-3 font-medium cursor-pointer hover:text-foreground">Status</th>
                <th className="px-4 py-3 font-medium cursor-pointer hover:text-foreground">Priority</th>
                <th className="px-4 py-3 font-medium cursor-pointer hover:text-foreground">Assignee</th>
                <th className="px-4 py-3 font-medium cursor-pointer hover:text-foreground">Created</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {mockTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-secondary/30 transition-colors group">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-border text-primary focus:ring-primary bg-secondary/50 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <Link to={`/tickets/${ticket.id}`} className="text-primary hover:underline">
                      {ticket.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 max-w-[300px]">
                    <div className="font-medium truncate mb-0.5">{ticket.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{ticket.company}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={ticket.assignee.avatar} alt="" className="w-6 h-6 rounded-full border border-border" />
                      <span className="text-xs font-medium truncate max-w-[120px]">{ticket.assignee.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-border flex items-center justify-between bg-secondary/10 text-sm text-muted-foreground">
          <div>Showing 1 to 20 of 1,248 entries</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-border rounded-md bg-background hover:bg-secondary disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-border rounded-md bg-primary/10 text-primary font-medium">1</button>
            <button className="px-3 py-1 border border-border rounded-md bg-background hover:bg-secondary">2</button>
            <button className="px-3 py-1 border border-border rounded-md bg-background hover:bg-secondary">3</button>
            <span className="px-2 py-1">...</span>
            <button className="px-3 py-1 border border-border rounded-md bg-background hover:bg-secondary">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}
