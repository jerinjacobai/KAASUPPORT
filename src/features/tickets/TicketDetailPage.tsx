import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, Send, History, Building2, User, RefreshCw, Edit3 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { useAuthStore } from '@/stores/auth-store';
import { useMasterStore } from '@/stores/master-store';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TimelineEvent {
  id: string;
  type: 'creation' | 'status_change' | 'comment';
  author: string;
  content: string;
  timestamp: string;
  isInternal?: boolean;
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const { isKaaInternal, userCompany, user } = useAuthStore();
  const { tickets, updateTicket } = useMasterStore();

  const [commentText, setCommentText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [timelineNotes, setTimelineNotes] = useState<TimelineEvent[]>([]);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('medium');

  const foundTicket = tickets.find(t => t.id === id || t.ticket_number === id);

  const normalize = (s?: string) => (s || '').trim().toLowerCase();
  const targetCompany = normalize(userCompany || '');
  const ticketCompany = normalize(foundTicket?.company || (foundTicket as any)?.contact_name || '');
  const matchesTenant = isKaaInternal || !targetCompany || 
    ticketCompany === targetCompany || 
    ticketCompany.includes(targetCompany) || 
    targetCompany.includes(ticketCompany);

  // Tenant Security Check
  if (!foundTicket || !matchesTenant) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">Ticket Not Found</h2>
        <p className="text-muted-foreground text-xs">
          The ticket <span className="font-mono text-primary font-bold">{id}</span> does not exist or you do not have permission to view it.
        </p>
        <Link to="/tickets" className="text-primary hover:underline flex items-center gap-2 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Ticket Registry
        </Link>
      </div>
    );
  }

  const ticket = {
    id: foundTicket.id,
    title: foundTicket.title,
    description: foundTicket.description || 'No detailed symptom description provided.',
    status: foundTicket.status || 'open',
    priority: foundTicket.priority || 'medium',
    company: foundTicket.company,
    category: foundTicket.category || 'Hardware',
    assignee: foundTicket.assignee || { name: 'Unassigned', avatar: '' },
    reporter: { 
      name: 'Client Requester', 
      email: `contact@${foundTicket.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` 
    },
    created: foundTicket.createdAt || new Date().toISOString(),
  };

  const handleOpenEdit = () => {
    setEditTitle(ticket.title);
    setEditDescription(ticket.description);
    setEditPriority(ticket.priority);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      toast.error('Please enter a ticket title');
      return;
    }
    updateTicket(ticket.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority
    });

    const newEvent: TimelineEvent = {
      id: `EVT-${Date.now()}`,
      type: 'status_change',
      author: user?.user_metadata?.full_name || (isKaaInternal ? 'KAA Support Staff' : 'Client User'),
      content: `Updated ticket details (Priority: ${editPriority.toUpperCase()})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTimelineNotes(prev => [newEvent, ...prev]);

    toast.success(`Ticket ${ticket.id} Updated!`);
    setEditModalOpen(false);
  };

  const handleMarkResolved = () => {
    updateTicket(ticket.id, { status: 'resolved' });
    const newEvent: TimelineEvent = {
      id: `EVT-${Date.now()}`,
      type: 'status_change',
      author: user?.user_metadata?.full_name || 'KAA Support Engineer',
      content: 'Marked ticket status as RESOLVED. Resolution recorded in service logs.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTimelineNotes(prev => [newEvent, ...prev]);
    toast.success(`Ticket ${ticket.id} marked as Resolved!`);
  };

  const handleReopenTicket = () => {
    updateTicket(ticket.id, { status: 'open' });
    const newEvent: TimelineEvent = {
      id: `EVT-${Date.now()}`,
      type: 'status_change',
      author: user?.user_metadata?.full_name || 'Client Requester',
      content: 'Re-opened ticket for further inspection.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTimelineNotes(prev => [newEvent, ...prev]);
    toast.success(`Ticket ${ticket.id} Re-opened!`, {
      description: 'Status returned to Open queue for triage.'
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) {
      toast.error('Please enter a note or service update');
      return;
    }

    const newEvent: TimelineEvent = {
      id: `EVT-${Date.now()}`,
      type: 'comment',
      author: user?.user_metadata?.full_name || (isKaaInternal ? 'KAA Support Staff' : 'Client User'),
      content: commentText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isInternal: isInternalNote
    };

    setTimelineNotes(prev => [newEvent, ...prev]);
    setCommentText('');
    setIsInternalNote(false);
    toast.success('Update logged to ticket history');
  };

  // Base creation event
  const creationEvent: TimelineEvent = {
    id: 'EVT-INIT',
    type: 'creation',
    author: ticket.company,
    content: `Ticket ${ticket.id} logged via KAA Support Portal with ${ticket.priority.toUpperCase()} priority.`,
    timestamp: new Date(ticket.created).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  };

  const allTimeline = [...timelineNotes, creationEvent];

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/tickets" className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold tracking-tight text-foreground font-mono">{ticket.id}</h1>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenEdit}
            className="gap-1.5 text-xs"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Details
          </Button>

          {isKaaInternal && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <Button 
              size="sm"
              onClick={handleMarkResolved}
              className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Resolve Ticket
            </Button>
          )}

          {(ticket.status === 'resolved' || ticket.status === 'closed') && (
            <Button 
              size="sm"
              onClick={handleReopenTicket}
              className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-semibold gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-open Ticket
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Content (Left, 2 cols) */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="glass rounded-xl p-6 border-border/50 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">{ticket.title}</h2>
            
            <div className="text-sm text-muted-foreground leading-relaxed bg-secondary/20 p-4 rounded-lg border border-border/40 whitespace-pre-line font-normal">
              {ticket.description}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass rounded-xl p-6 border-border/50">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Resolution Timeline & Service Updates
              </h3>
            </div>

            <div className="space-y-4">
              {allTimeline.map((item) => (
                <div key={item.id} className="glass p-4 rounded-xl border border-border shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">{item.author}</span>
                      {item.isInternal && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-medium">
                          Internal Note
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comment Input */}
          <div className="glass rounded-xl p-4 border-border/50 mt-4">
            <textarea 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-3 text-xs min-h-[90px] outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none text-foreground"
              placeholder="Add an update or field service note..."
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                {isKaaInternal && (
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="internal-check" 
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-border text-amber-500 focus:ring-amber-500 bg-secondary/50 w-4 h-4" 
                    />
                    <label htmlFor="internal-check" className="text-xs font-medium text-amber-500 cursor-pointer">Internal Note</label>
                  </div>
                )}
              </div>
              <Button 
                size="sm"
                onClick={handleAddComment}
                className="gap-2 text-xs"
              >
                <Send className="w-3.5 h-3.5" /> Post Update
              </Button>
            </div>
          </div>

        </div>

        {/* Sidebar (Right, 1 col) */}
        <div className="space-y-6">
          
          {/* Properties Panel */}
          <div className="glass rounded-xl p-5 border-border/50 space-y-4">
            <h3 className="font-semibold text-sm mb-2 border-b border-border pb-2 text-foreground">Ticket Properties</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Assignee Engineer</label>
                <div className="flex items-center justify-between p-2 rounded-md bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-[10px] font-bold">
                      {ticket.assignee.name.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-foreground">{ticket.assignee.name}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Client Organization</label>
                  <div className="text-xs font-bold text-primary flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {ticket.company}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                  <div className="text-xs font-medium text-foreground">{ticket.category}</div>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Reporter Contact</label>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary text-foreground flex items-center justify-center text-[10px]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-foreground">{ticket.reporter.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{ticket.reporter.email}</div>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-border flex justify-between text-xs text-muted-foreground">
                <span>Logged At:</span>
                <span className="font-mono text-foreground">{new Date(ticket.created).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* SLA Guarantee Panel */}
          <div className="glass rounded-xl p-5 border-border/50 space-y-4">
            <h3 className="font-semibold text-sm mb-2 border-b border-border pb-2 flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-primary" /> Enterprise SLA Status
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Response SLA</span>
                  <span className="text-emerald-400 font-bold">Active</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[100%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Target Resolution Time</span>
                  <span className="text-primary font-bold">
                    {ticket.priority === 'urgent' ? '4 Hours' : ticket.priority === 'high' ? '8 Hours' : '24 Hours'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[75%]"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Edit Ticket Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Ticket Details</DialogTitle>
            <DialogDescription>
              Update the title, priority, and description for ticket <span className="font-mono text-primary font-bold">{ticket.id}</span>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Ticket Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-foreground"
                placeholder="Brief summary of the issue..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Priority Level</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-foreground"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Detailed Description</label>
              <textarea
                rows={4}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg p-3 text-xs focus:outline-none focus:border-primary text-foreground resize-none"
                placeholder="Detailed explanation of symptoms, fault codes, and machine behavior..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
