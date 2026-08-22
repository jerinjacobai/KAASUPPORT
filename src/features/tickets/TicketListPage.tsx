import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Plus, Search, Download, Lock, Building2, RefreshCw, Eye, CheckCircle2, UserCheck, FileText, ChevronDown, Edit3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/stores/auth-store';
import { useMasterStore } from '@/stores/master-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTickets } from '@/hooks/useTickets';
import { toast } from 'sonner';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function TicketListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // Edit Ticket Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('medium');

  const { isKaaInternal, userCompany } = useAuthStore();
  const { tickets: storeTickets, updateTicket } = useMasterStore();
  const { data: remoteTickets = [], isLoading, refetch, isRefetching } = useTickets();

  // Combine store tickets and remote tickets avoiding duplicates
  const allTicketsMap = new Map();
  storeTickets.forEach(t => allTicketsMap.set(t.id || t.ticket_number, t));
  remoteTickets.forEach((t: any) => {
    const key = t.id || t.ticket_number;
    if (key && !allTicketsMap.has(key)) {
      allTicketsMap.set(key, t);
    }
  });
  const tickets = Array.from(allTicketsMap.values());

  const normalize = (s?: string) => (s || '').trim().toLowerCase();
  const targetCompany = normalize(userCompany || '');

  // Multi-tenant Row-Level Security Filtering + Status & Priority Filters
  const filteredTickets = tickets.filter((ticket: any) => {
    const ticketComp = normalize(ticket.company || ticket.contact_name || '');
    const matchesTenant = isKaaInternal || !targetCompany || 
      ticketComp === targetCompany || 
      ticketComp.includes(targetCompany) || 
      targetCompany.includes(ticketComp);
    
    const matchesStatus = statusFilter === 'all' ? true : 
      (ticket.status || '').toLowerCase() === statusFilter.toLowerCase();
      
    const matchesPriority = priorityFilter === 'all' ? true : 
      (ticket.priority || '').toLowerCase() === priorityFilter.toLowerCase();

    const matchesSearch = 
      (ticket.id || ticket.ticket_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.company || ticket.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.assignee?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTenant && matchesStatus && matchesPriority && matchesSearch;
  });

  const safeFormatDistance = (dateValue: any): string => {
    if (!dateValue) return 'Recently';
    try {
      const parsed = new Date(dateValue);
      if (isNaN(parsed.getTime())) return 'Recently';
      return formatDistanceToNow(parsed, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Ticket ID', 'Title', 'Client Company', 'Priority', 'Status', 'Assignee', 'Created At'];
      const csvRows = [
        headers.join(','),
        ...filteredTickets.map((t: any) => [
          `"${t.id || t.ticket_number || ''}"`,
          `"${(t.title || '').replace(/"/g, '""')}"`,
          `"${(t.company || 'KAA Client').replace(/"/g, '""')}"`,
          `"${t.priority || 'medium'}"`,
          `"${t.status || 'open'}"`,
          `"${t.assignee?.name || 'Unassigned'}"`,
          `"${t.createdAt || t.created_at || new Date().toISOString()}"`,
        ].join(','))
      ];

      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const csvUrl = URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = csvUrl;
      link.setAttribute('download', `KAA_Tickets_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Ticket List Exported!', {
        description: `Exported ${filteredTickets.length} tickets to CSV format.`
      });
    } catch {
      toast.error('Failed to export tickets to CSV');
    }
  };

  const handleManualSync = () => {
    refetch();
    toast.info('Synchronized with Supabase', {
      description: 'Fetched latest tickets and field status logs.'
    });
  };

  const handleQuickStatusChange = (ticketId: string, newStatus: string) => {
    updateTicket(ticketId, { status: newStatus });
    toast.success(`Ticket ${ticketId} updated`, {
      description: `Status changed to ${newStatus.replace('_', ' ')}.`
    });
  };

  const handleOpenEdit = (ticket: any) => {
    setEditingTicket(ticket);
    setEditTitle(ticket.title || '');
    setEditDescription(ticket.description || '');
    setEditPriority(ticket.priority || 'medium');
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      toast.error('Ticket title is required');
      return;
    }

    if (editingTicket) {
      updateTicket(editingTicket.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
      });

      toast.success(`Ticket ${editingTicket.id} updated!`, {
        description: 'Changes saved successfully.'
      });
      setEditModalOpen(false);
      setEditingTicket(null);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader 
        title={isKaaInternal ? "Support Tickets (All Clients)" : `My Tickets (${userCompany || 'Client Scope'})`} 
        description={isKaaInternal ? "Manage and track customer support requests across all KAA client companies." : `Track status, field engineer visits, and updates for ${userCompany || 'your company'} tickets.`}
      >
        <div className="flex gap-2">
          <button
            onClick={handleManualSync}
            disabled={isRefetching}
            className="p-2 border border-border bg-secondary/50 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title="Sync with Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
          <Link 
            to="/tickets/new" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Raise Ticket
          </Link>
        </div>
      </PageHeader>

      <div className="glass rounded-xl border border-border flex flex-col flex-1 min-h-0 overflow-hidden animate-slide-in-up shadow-xl">
        
        {/* Toolbar & Filter Dropdowns */}
        <div className="glass p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative group w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by ID, title, or assignee..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 pl-9 pr-4 text-sm outline-none transition-all text-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {!isKaaInternal && (
              <Badge variant="outline" className="text-xs py-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold gap-1 shrink-0">
                <Lock className="w-3 h-3" /> Mapped to {userCompany || 'Client Scope'} Only
              </Badge>
            )}
            
            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-card border border-border text-foreground rounded-lg appearance-none cursor-pointer px-3 py-2 pr-8 outline-none focus:border-primary text-xs font-medium"
              style={{ backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a1a1aa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.7rem top 50%", backgroundSize: "0.65rem auto" }}
            >
              <option value="all">Status: All</option>
              <option value="open">Status: Open</option>
              <option value="in_progress">Status: In Progress</option>
              <option value="waiting_on_customer">Status: Waiting Customer</option>
              <option value="resolved">Status: Resolved</option>
            </select>

            {/* Priority Filter Dropdown */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-card border border-border text-foreground rounded-lg appearance-none cursor-pointer px-3 py-2 pr-8 outline-none focus:border-primary text-xs font-medium"
              style={{ backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a1a1aa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.7rem top 50%", backgroundSize: "0.65rem auto" }}
            >
              <option value="all">Priority: All</option>
              <option value="critical">Priority: Critical</option>
              <option value="high">Priority: High</option>
              <option value="medium">Priority: Medium</option>
              <option value="low">Priority: Low</option>
            </select>

            <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
            
            <button 
              onClick={handleExportCSV}
              className="p-2 border border-border rounded-lg bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" 
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Container with proper horizontal scrolling & minimum width */}
        <div className="flex-1 overflow-x-auto w-full">
          {isLoading && tickets.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full min-w-[950px] text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-secondary/80 backdrop-blur border-b border-border z-10 text-muted-foreground uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="p-4 w-10">
                    <input type="checkbox" className="rounded border-border" />
                  </th>
                  <th className="p-4 w-28">Ticket ID</th>
                  <th className="p-4 min-w-[200px]">Title</th>
                  {isKaaInternal && <th className="p-4 w-44">Client Company</th>}
                  <th className="p-4 w-28">Priority</th>
                  <th className="p-4 w-28">Status</th>
                  <th className="p-4 w-36">Assignee</th>
                  <th className="p-4 w-32">Created</th>
                  <th className="p-4 text-right pr-6 w-44">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={isKaaInternal ? 9 : 8} className="p-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <FileText className="w-12 h-12 text-muted-foreground/30 mb-3" />
                        <h3 className="text-base font-bold text-foreground">No Support Tickets Found</h3>
                        <p className="text-xs text-muted-foreground mt-1 mb-4">No tickets match your filter criteria or no tickets have been raised yet.</p>
                        <Link to="/tickets/new" className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-md">
                          + Raise New Ticket
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket: any) => {
                    const isResolvedOrClosed = ticket.status === 'resolved' || ticket.status === 'closed';

                    return (
                      <tr key={ticket.id} className="hover:bg-secondary/40 transition-all duration-200 group">
                        <td className="p-4">
                          <input type="checkbox" className="rounded border-border" />
                        </td>
                        <td className="p-4 font-mono font-medium text-primary">
                          <Link to={`/tickets/${ticket.id}`} className="hover:underline flex items-center gap-1">
                            {ticket.id || ticket.ticket_number}
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
                            <span className="flex items-center gap-1 truncate">
                              <Building2 className="w-3.5 h-3.5 text-primary shrink-0" /> {ticket.company || 'KAA Client'}
                            </span>
                          </td>
                        )}
                        <td className="p-4">
                          <PriorityBadge priority={ticket.priority || 'medium'} />
                        </td>
                        <td className="p-4">
                          <StatusBadge status={ticket.status || 'open'} />
                        </td>
                        <td className="p-4">
                          {(!ticket.assignee?.name || ticket.assignee.name === 'Unassigned' || ticket.assignee.name === 'Support Staff') ? (
                            <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground border-border/60">
                              Unassigned
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold flex items-center justify-center text-[10px]">
                                {ticket.assignee.name.charAt(0)}
                              </div>
                              <span className="text-xs text-foreground font-medium truncate max-w-[100px]">{ticket.assignee.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                          {safeFormatDistance(ticket.createdAt || ticket.created_at)}
                        </td>
                        <td className="p-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/tickets/${ticket.id}`}>
                              <button className="px-2.5 py-1 text-xs font-semibold rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
                            </Link>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="px-2.5 py-1 text-xs font-semibold rounded-md bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-all flex items-center gap-1">
                                  Actions <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-card border-border text-foreground shadow-2xl z-50">
                                <DropdownMenuLabel className="text-xs text-muted-foreground">Ticket Actions</DropdownMenuLabel>
                                
                                <DropdownMenuItem onClick={() => navigate(`/tickets/${ticket.id}`)} className="cursor-pointer gap-2 text-xs">
                                  <Eye className="w-3.5 h-3.5 text-primary" /> View Details
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => handleOpenEdit(ticket)} className="cursor-pointer gap-2 text-xs">
                                  <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Edit Ticket
                                </DropdownMenuItem>

                                {isKaaInternal && (
                                  <>
                                    <DropdownMenuSeparator className="bg-border/50" />
                                    {ticket.status !== 'in_progress' && (
                                      <DropdownMenuItem onClick={() => handleQuickStatusChange(ticket.id, 'in_progress')} className="cursor-pointer gap-2 text-xs">
                                        <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Mark In Progress
                                      </DropdownMenuItem>
                                    )}
                                    {ticket.status !== 'resolved' && (
                                      <DropdownMenuItem onClick={() => handleQuickStatusChange(ticket.id, 'resolved')} className="cursor-pointer gap-2 text-xs">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mark Resolved
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )}

                                {isResolvedOrClosed && (
                                  <>
                                    <DropdownMenuSeparator className="bg-border/50" />
                                    <DropdownMenuItem onClick={() => handleQuickStatusChange(ticket.id, 'open')} className="cursor-pointer gap-2 text-xs">
                                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Re-open Ticket
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-secondary/10">
          <span>Showing {filteredTickets.length} tickets</span>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded border border-border bg-background hover:bg-secondary disabled:opacity-50 text-foreground" disabled>Previous</button>
            <button className="px-2.5 py-1 rounded border border-border bg-background hover:bg-secondary disabled:opacity-50 text-foreground" disabled>Next</button>
          </div>
        </div>

      </div>

      {/* Edit Ticket Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-primary" /> Edit Ticket ({editingTicket?.id || editingTicket?.ticket_number})
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update ticket title, description, and severity priority.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Ticket Title *</label>
              <input 
                type="text" 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Ticket issue summary..."
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Priority Level</label>
              <select 
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              >
                <option value="low">Low (Routine / Non-urgent)</option>
                <option value="medium">Medium (Standard Request)</option>
                <option value="high">High (Production Impairment)</option>
                <option value="critical">Critical (Emergency Shutdown)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Issue Description</label>
              <textarea 
                rows={4}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Detailed description of the issue..."
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
