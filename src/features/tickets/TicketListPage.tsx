import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Plus, Search, Download, Lock, Building2, RefreshCw, Eye, CheckCircle2, UserCheck, FileText, Edit3, MoreHorizontal, CircleDot, Activity } from 'lucide-react';
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

  // Keep summary metrics scoped to the active tenant, independent of filters.
  const tenantTickets = tickets.filter((ticket: any) => {
    const ticketComp = normalize(ticket.company || ticket.contact_name || '');
    return isKaaInternal || !targetCompany ||
      ticketComp === targetCompany || 
      ticketComp.includes(targetCompany) || 
      targetCompany.includes(ticketComp);
  });

  const filteredTickets = tenantTickets.filter((ticket: any) => {
    const matchesStatus = statusFilter === 'all' ? true : 
      (ticket.status || '').toLowerCase() === statusFilter.toLowerCase();
      
    const matchesPriority = priorityFilter === 'all' ? true : 
      (ticket.priority || '').toLowerCase() === priorityFilter.toLowerCase();

    const matchesSearch = 
      (ticket.id || ticket.ticket_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.company || ticket.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.assignee?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const ticketStats = [
    { label: 'All tickets', value: tenantTickets.length, filter: 'all', icon: FileText, tone: 'text-primary bg-primary/10' },
    { label: 'Open', value: tenantTickets.filter((ticket: any) => ticket.status === 'open').length, filter: 'open', icon: CircleDot, tone: 'text-amber-400 bg-amber-400/10' },
    { label: 'In progress', value: tenantTickets.filter((ticket: any) => ticket.status === 'in_progress').length, filter: 'in_progress', icon: Activity, tone: 'text-blue-400 bg-blue-400/10' },
    { label: 'Resolved', value: tenantTickets.filter((ticket: any) => ticket.status === 'resolved').length, filter: 'resolved', icon: CheckCircle2, tone: 'text-emerald-400 bg-emerald-400/10' },
  ];

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

  const handleQuickStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await updateTicket(ticketId, { status: newStatus });
      toast.success(`Ticket ${ticketId} updated`, {
        description: `Status changed to ${newStatus.replace('_', ' ')}.`
      });
    } catch (error) {
      toast.error('Ticket status was not saved', { description: error instanceof Error ? error.message : 'Please try again.' });
    }
  };

  const handleOpenEdit = (ticket: any) => {
    setEditingTicket(ticket);
    setEditTitle(ticket.title || '');
    setEditDescription(ticket.description || '');
    setEditPriority(ticket.priority || 'medium');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      toast.error('Ticket title is required');
      return;
    }

    if (editingTicket) {
      try {
      await updateTicket(editingTicket.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
      });

      toast.success(`Ticket ${editingTicket.id} updated!`, {
        description: 'Changes saved successfully.'
      });
      setEditModalOpen(false);
      setEditingTicket(null);
      } catch (error) {
        toast.error('Ticket changes were not saved', { description: error instanceof Error ? error.message : 'Please try again.' });
      }
    }
  };

  return (
    <div className="space-y-5 min-h-full flex flex-col">
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

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {ticketStats.map(({ label, value, filter, icon: Icon, tone }) => (
          <button key={label} type="button" onClick={() => { setStatusFilter(filter); setPriorityFilter('all'); }}
            className={`group flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${statusFilter === filter ? 'border-primary/50 bg-primary/[0.07] shadow-sm shadow-primary/5' : 'border-border/70 bg-card/60 hover:border-border hover:bg-card'}`}>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></span>
            <span className="min-w-0"><span className="block text-xs font-medium text-muted-foreground">{label}</span><span className="mt-0.5 block text-xl font-semibold tracking-tight text-foreground">{value}</span></span>
          </button>
        ))}
      </div>

      <div className="glass rounded-xl border border-border/80 flex flex-col overflow-hidden animate-slide-in-up shadow-lg shadow-black/10">
        
        {/* Toolbar & Filter Dropdowns */}
        <div className="bg-card/70 p-4 border-b border-border/80 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative group w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search by ID, title, or assignee..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background/80 border border-border/80 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 rounded-lg py-2.5 pl-9 pr-4 text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground/70"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {!isKaaInternal && (
              <Badge variant="outline" className="text-xs py-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold gap-1 shrink-0">
                <Lock className="w-3 h-3" /> Mapped to {userCompany || 'Client Scope'} Only
              </Badge>
            )}
            
            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background/80 border border-border/80 text-foreground rounded-lg appearance-none cursor-pointer px-3 py-2.5 pr-8 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 text-xs font-medium"
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
              className="bg-background/80 border border-border/80 text-foreground rounded-lg appearance-none cursor-pointer px-3 py-2.5 pr-8 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 text-xs font-medium"
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
              className="p-2.5 border border-border/80 rounded-lg bg-background/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Container with proper horizontal scrolling & minimum width */}
        <div className="overflow-x-auto w-full">
          {isLoading && tickets.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full min-w-[880px] text-left border-collapse text-sm">
              <thead className="bg-secondary/50 border-b border-border/80 text-muted-foreground uppercase text-[10px] font-semibold tracking-[0.08em]">
                <tr>
                  <th className="px-4 py-3.5 w-28">Ticket ID</th>
                  <th className="px-4 py-3.5 min-w-[200px]">Title</th>
                  {isKaaInternal && <th className="px-4 py-3.5 w-40">Client</th>}
                  <th className="px-4 py-3.5 w-28">Priority</th>
                  <th className="px-4 py-3.5 w-32">Status</th>
                  <th className="px-4 py-3.5 w-36">Assignee</th>
                  <th className="px-4 py-3.5 w-32">Created</th>
                  <th className="px-4 py-3.5 text-right pr-5 w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={isKaaInternal ? 8 : 7} className="px-6 py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-secondary/60 mb-4"><FileText className="w-5 h-5 text-muted-foreground" /></span>
                        <h3 className="text-sm font-semibold text-foreground">{tenantTickets.length === 0 ? 'Your queue is clear' : 'No tickets match these filters'}</h3>
                        <p className="text-xs leading-relaxed text-muted-foreground mt-1.5 mb-4">{tenantTickets.length === 0 ? 'New support requests will appear here as soon as they are submitted.' : 'Try changing the search, status, or priority filters.'}</p>
                        {tenantTickets.length === 0 ? (
                          <Link to="/tickets/new" className="px-3.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20">Raise a ticket</Link>
                        ) : (
                          <button type="button" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPriorityFilter('all'); }} className="text-xs font-medium text-primary hover:text-primary/80">Clear filters</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket: any) => {
                    const isResolvedOrClosed = ticket.status === 'resolved' || ticket.status === 'closed';

                    return (
                      <tr key={ticket.id || ticket.ticket_number} className="border-b border-border/50 hover:bg-secondary/25 transition-colors group">
                        <td className="px-4 py-3.5 font-mono text-[11px] font-semibold text-primary">
                          <Link to={`/tickets/${ticket.id}`} className="hover:underline inline-flex items-center gap-1.5">
                            <span className="rounded-md border border-primary/15 bg-primary/[0.06] px-2 py-1">
                            {ticket.id || ticket.ticket_number}
                            </span>
                            {ticket.slaBreached && (
                              <span className="w-2 h-2 rounded-full bg-destructive animate-ping" title="SLA Breached" />
                            )}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 max-w-md font-medium text-foreground">
                          <Link to={`/tickets/${ticket.id}`} className="hover:text-primary transition-colors block truncate">
                            {ticket.title}
                          </Link>
                        </td>
                        {isKaaInternal && (
                          <td className="px-4 py-3.5 text-muted-foreground">
                            <span className="flex items-center gap-1 truncate">
                              <Building2 className="w-3.5 h-3.5 text-primary shrink-0" /> {ticket.company || 'KAA Client'}
                            </span>
                          </td>
                        )}
                        <td className="px-4 py-3.5">
                          <PriorityBadge priority={ticket.priority || 'medium'} />
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={ticket.status || 'open'} />
                        </td>
                        <td className="px-4 py-3.5">
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
                        <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {safeFormatDistance(ticket.createdAt || ticket.created_at)}
                        </td>
                        <td className="px-4 py-3.5 text-right pr-5">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/tickets/${ticket.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/70 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
                              <Eye className="w-3.5 h-3.5" /> View
                            </Link>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button aria-label="More ticket actions" className="grid h-8 w-8 place-items-center rounded-lg border border-border/80 bg-background/70 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52 rounded-xl bg-card border-border/80 text-foreground shadow-2xl shadow-black/30 z-50">
                                <DropdownMenuLabel className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Ticket actions</DropdownMenuLabel>

                                <DropdownMenuItem onClick={() => handleOpenEdit(ticket)} className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-xs">
                                  <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Edit Ticket
                                </DropdownMenuItem>

                                {isKaaInternal && (
                                  <>
                                    <DropdownMenuSeparator className="bg-border/50" />
                                    {ticket.status !== 'in_progress' && (
                                      <DropdownMenuItem onClick={() => handleQuickStatusChange(ticket.id, 'in_progress')} className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-xs">
                                        <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Mark In Progress
                                      </DropdownMenuItem>
                                    )}
                                    {ticket.status !== 'resolved' && (
                                      <DropdownMenuItem onClick={() => handleQuickStatusChange(ticket.id, 'resolved')} className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-xs">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mark Resolved
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )}

                                {isResolvedOrClosed && (
                                  <>
                                    <DropdownMenuSeparator className="bg-border/50" />
                                    <DropdownMenuItem onClick={() => handleQuickStatusChange(ticket.id, 'open')} className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-xs">
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
        <div className="px-4 py-3 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground bg-card/50">
          <span>Showing <span className="font-medium text-foreground">{filteredTickets.length}</span> of <span className="font-medium text-foreground">{tenantTickets.length}</span> tickets</span>
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
