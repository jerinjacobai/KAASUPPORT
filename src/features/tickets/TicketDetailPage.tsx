import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Paperclip, CheckCircle2, Send, History } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { mockTimeline } from '@/lib/mock-data';
import { useMasterStore } from '@/stores/master-store';
import { toast } from 'sonner';

export default function TicketDetailPage() {
  const { id } = useParams();
  const { tickets, updateTicket } = useMasterStore();

  const foundTicket = tickets.find(t => t.id === id || t.ticket_number === id);

  if (!foundTicket) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">Ticket Not Found</h2>
        <p className="text-muted-foreground text-xs">The ticket <span className="font-mono text-primary font-bold">{id}</span> does not exist or you don't have access.</p>
        <Link to="/tickets" className="text-primary hover:underline flex items-center gap-2 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Ticket Registry
        </Link>
      </div>
    );
  }

  // Use found ticket data
  const ticket = {
    id: foundTicket.id,
    title: foundTicket.title,
    description: foundTicket.description || 'No detailed symptom description provided.',
    status: foundTicket.status || 'open',
    priority: foundTicket.priority || 'medium',
    company: foundTicket.company,
    category: foundTicket.category || 'Hardware',
    assignee: foundTicket.assignee || { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=1' },
    reporter: { name: 'Field Dispatcher', avatar: 'https://i.pravatar.cc/150?u=5', email: `dispatch@${foundTicket.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` },
    created: foundTicket.createdAt || '2026-08-11T10:00:00Z',
  };

  const handleMarkResolved = () => {
    updateTicket(ticket.id, { status: 'resolved' });
    toast.success(`Ticket ${ticket.id} marked as Resolved!`, {
      description: 'Resolution recorded in enterprise audit log.'
    });
  };

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
          <button className="px-3 py-1.5 border border-border bg-background hover:bg-secondary rounded-md text-xs font-medium transition-colors text-foreground">
            Edit Details
          </button>
          <button 
            onClick={handleMarkResolved}
            className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Resolve Ticket
          </button>
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
            
            <div className="mt-6 flex gap-2">
              <div className="px-3 py-2 bg-secondary/50 rounded-lg flex items-center gap-2 text-xs border border-border font-mono text-muted-foreground">
                <Paperclip className="w-4 h-4 text-primary" />
                <span>diagnostics_log_2026.txt</span>
                <span className="text-muted-foreground ml-2">1.8 MB</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass rounded-xl p-6 border-border/50">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Resolution Timeline & Updates
              </h3>
              <div className="flex gap-2">
                <button className="text-xs bg-secondary px-2 py-1 rounded text-foreground font-medium">All Activity</button>
                <button className="text-xs hover:bg-secondary px-2 py-1 rounded text-muted-foreground transition-colors">Comments</button>
              </div>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/30 before:via-primary/20 before:to-transparent">
              
              {mockTimeline.map((item) => (
                <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary bg-card shadow-[0_0_15px_rgba(var(--primary),0.2)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                    {item.type === 'comment' ? (
                      <img src={item.user.avatar} className="w-full h-full rounded-full border border-border" alt="" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  {/* Connector Line (Horizontal) - hidden on mobile */}
                  <div className="hidden md:block w-8 h-0.5 bg-primary/20 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                  
                  {/* Content */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass p-4 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs text-foreground">{item.user.name}</span>
                      <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.content}</p>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Comment Input */}
          <div className="glass rounded-xl p-4 border-border/50 mt-4">
            <textarea 
              className="w-full bg-background border border-border rounded-lg p-3 text-xs min-h-[90px] outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none text-foreground"
              placeholder="Add an update or field service note..."
            ></textarea>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <button className="p-2 text-muted-foreground hover:bg-secondary rounded-md transition-colors" title="Attach file">
                  <Paperclip className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="internal" className="rounded border-border text-amber-500 focus:ring-amber-500 bg-secondary/50 w-4 h-4" />
                  <label htmlFor="internal" className="text-xs font-medium text-amber-500 cursor-pointer">Internal Note</label>
                </div>
              </div>
              <button 
                onClick={() => toast.success('Note added to ticket history')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Update
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar (Right, 1 col) */}
        <div className="space-y-6">
          
          {/* Properties Panel */}
          <div className="glass rounded-xl p-5 border-border/50 space-y-4">
            <h3 className="font-semibold text-sm mb-2 border-b border-border pb-2 text-foreground">Properties</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Assignee Engineer</label>
                <div className="flex items-center justify-between p-2 rounded-md bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2">
                    <img src={ticket.assignee.avatar} className="w-6 h-6 rounded-full" alt="" />
                    <span className="text-xs font-medium text-foreground">{ticket.assignee.name}</span>
                  </div>
                  <button className="text-xs text-primary hover:underline font-medium">Reassign</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Client Organization</label>
                  <div className="text-xs font-bold text-primary">{ticket.company}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                  <div className="text-xs font-medium text-foreground">{ticket.category}</div>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Reporter Contact</label>
                <div className="flex items-center gap-2">
                  <img src={ticket.reporter.avatar} className="w-6 h-6 rounded-full" alt="" />
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

          {/* SLA Panel */}
          <div className="glass rounded-xl p-5 border-border/50 space-y-4">
            <h3 className="font-semibold text-sm mb-2 border-b border-border pb-2 flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-primary" /> SLA Performance Guarantee
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">First Response SLA</span>
                  <span className="text-emerald-400 font-bold">Achieved (12m)</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[100%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Resolution SLA</span>
                  <span className="text-emerald-400 font-bold">On Schedule</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[75%]"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
