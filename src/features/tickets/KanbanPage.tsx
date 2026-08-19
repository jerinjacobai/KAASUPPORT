import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Plus, Search, Lock, Building2, MoreHorizontal, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useMasterStore } from '@/stores/master-store';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const KANBAN_COLUMNS = [
  { id: 'open', title: 'New / Open', color: 'border-blue-500/40 bg-blue-500/5' },
  { id: 'in_progress', title: 'In Progress', color: 'border-yellow-500/40 bg-yellow-500/5' },
  { id: 'waiting_on_customer', title: 'Waiting Customer', color: 'border-orange-500/40 bg-orange-500/5' },
  { id: 'resolved', title: 'Resolved', color: 'border-emerald-500/40 bg-emerald-500/5' },
];

export default function KanbanPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { isKaaInternal, userCompany } = useAuthStore();
  const { tickets, updateTicket } = useMasterStore();
  const [draggedTicket, setDraggedTicket] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const filteredTickets = tickets.filter(ticket => {
    const matchesTenant = isKaaInternal ? true : (ticket.company === userCompany);
    const matchesSearch = 
      (ticket.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.company || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTenant && matchesSearch;
  });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isKaaInternal) return;
    setDraggedTicket(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    if (!isKaaInternal) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!draggedTicket || !isKaaInternal) return;
    
    updateTicket(draggedTicket, { status: statusId });
    setDraggedTicket(null);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader
        title={isKaaInternal ? "Ticket Kanban Board" : `My Tickets Board (${userCompany})`}
        description="Visual workflow board grouped by resolution lifecycle stage."
      >
        <div className="flex gap-2">
          <Link
            to="/tickets"
            className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-secondary transition-colors text-foreground"
          >
            Table View
          </Link>
          <Link
            to="/tickets/new"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Raise Ticket
          </Link>
        </div>
      </PageHeader>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/30 p-3 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter Kanban tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-primary text-foreground"
          />
        </div>

        {!isKaaInternal && (
          <Badge variant="outline" className="text-xs py-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold gap-1">
            <Lock className="w-3 h-3" /> Mapped to {userCompany}
          </Badge>
        )}
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-1 min-h-[500px]">
        {KANBAN_COLUMNS.map((col) => {
          const colTickets = filteredTickets.filter(t => (t.status || 'open') === col.id);
          const isDraggingOver = dragOverCol === col.id;

          return (
            <div 
              key={col.id} 
              className={`glass rounded-xl border p-4 flex flex-col space-y-4 transition-colors ${
                isDraggingOver ? 'border-primary/50 bg-primary/5' : col.color
              }`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  {col.title}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border font-bold text-muted-foreground">
                    {colTickets.length}
                  </span>
                </h3>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {colTickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    draggable={isKaaInternal}
                    onDragStart={(e) => handleDragStart(e, ticket.id)}
                    className={`glass rounded-lg p-4 border border-border hover:border-primary/50 transition-all shadow-md group ${isKaaInternal ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} space-y-3 ${
                      draggedTicket === ticket.id ? 'opacity-50 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Link to={`/tickets/${ticket.id}`} className="font-mono text-xs font-bold text-primary hover:underline">
                        {ticket.id}
                      </Link>
                      <PriorityBadge priority={ticket.priority || 'medium'} />
                    </div>

                    <h4 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {ticket.title}
                    </h4>

                    {isKaaInternal && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-primary shrink-0" /> {ticket.company}
                      </p>
                    )}

                    <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        {(!ticket.assignee?.name || ticket.assignee.name === 'Unassigned' || ticket.assignee.name === 'Support Staff') ? (
                          <span className="text-[11px] text-muted-foreground italic">Unassigned</span>
                        ) : (
                          <>
                            <div className="w-5 h-5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold flex items-center justify-center text-[9px]">
                              {ticket.assignee.name.charAt(0)}
                            </div>
                            <span className="truncate max-w-[90px] text-foreground font-medium">{ticket.assignee.name}</span>
                          </>
                        )}
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(ticket.createdAt || Date.now()), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}

                {colTickets.length === 0 && (
                  <div className="h-32 rounded-lg border border-dashed border-border/60 flex items-center justify-center text-xs text-muted-foreground">
                    No tickets in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
