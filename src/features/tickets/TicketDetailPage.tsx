import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Paperclip, CheckCircle2, AlertTriangle, Send, History } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { mockTimeline } from '@/lib/mock-data';

export default function TicketDetailPage() {
  const { id } = useParams();

  // Mock specific data
  const ticket = {
    id: id || 'TKT-1042',
    title: 'Main server database connection timeout',
    description: '<p>The main production database is rejecting connections after 100 concurrent users. We are seeing timeout errors in the application logs.</p><p>Please investigate urgently as this is affecting customer checkouts.</p>',
    status: 'in_progress',
    priority: 'critical',
    company: 'Acme Corp',
    project: 'E-commerce Platform',
    assignee: { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=1' },
    reporter: { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=5', email: 'john@acme.com' },
    created: '2023-10-24T10:00:00Z',
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
              <h1 className="text-xl font-bold tracking-tight">{ticket.id}</h1>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-border bg-background hover:bg-secondary rounded-md text-sm font-medium transition-colors">
            Edit
          </button>
          <button className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Resolve
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Content (Left, 2 cols) */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="glass rounded-xl p-6 border-border/50">
            <h2 className="text-2xl font-semibold mb-4">{ticket.title}</h2>
            
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: ticket.description }} />
            
            <div className="mt-6 flex gap-2">
              <div className="px-3 py-2 bg-secondary/50 rounded-lg flex items-center gap-2 text-sm border border-border">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <span>error_logs.txt</span>
                <span className="text-xs text-muted-foreground ml-2">2.4 MB</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass rounded-xl p-6 border-border/50">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <History className="w-4 h-4" /> Activity Timeline
              </h3>
              <div className="flex gap-2">
                <button className="text-xs bg-secondary px-2 py-1 rounded text-foreground font-medium">All Activity</button>
                <button className="text-xs hover:bg-secondary px-2 py-1 rounded text-muted-foreground transition-colors">Comments</button>
              </div>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              
              {mockTimeline.map((item) => (
                <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                    {item.type === 'comment' ? (
                      <img src={item.user.avatar} className="w-full h-full rounded-full" alt="" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass p-4 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{item.user.name}</span>
                      <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Comment Input */}
          <div className="glass rounded-xl p-4 border-border/50 mt-4">
            <textarea 
              className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[100px] outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
              placeholder="Add a reply or internal note..."
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
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Send className="w-4 h-4" /> Send Reply
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar (Right, 1 col) */}
        <div className="space-y-6">
          
          {/* Properties Panel */}
          <div className="glass rounded-xl p-5 border-border/50">
            <h3 className="font-semibold mb-4 border-b border-border pb-2">Properties</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Assignee</label>
                <div className="flex items-center justify-between p-2 rounded-md bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2">
                    <img src={ticket.assignee.avatar} className="w-6 h-6 rounded-full" alt="" />
                    <span className="text-sm font-medium">{ticket.assignee.name}</span>
                  </div>
                  <button className="text-xs text-primary hover:underline">Change</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Company</label>
                  <div className="text-sm font-medium">{ticket.company}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Project</label>
                  <div className="text-sm font-medium">{ticket.project}</div>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Reporter</label>
                <div className="flex items-center gap-2">
                  <img src={ticket.reporter.avatar} className="w-6 h-6 rounded-full" alt="" />
                  <div>
                    <div className="text-sm font-medium">{ticket.reporter.name}</div>
                    <div className="text-xs text-muted-foreground">{ticket.reporter.email}</div>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-border flex justify-between text-xs text-muted-foreground">
                <span>Created</span>
                <span>Oct 24, 2023 10:00 AM</span>
              </div>
            </div>
          </div>

          {/* SLA Panel */}
          <div className="glass rounded-xl p-5 border-border/50">
            <h3 className="font-semibold mb-4 border-b border-border pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> SLA Status
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">First Response</span>
                  <span className="text-emerald-500 font-medium">Achieved</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[100%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Resolution</span>
                  <span className="text-destructive font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> 2h overdue
                  </span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-destructive w-[100%] animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
