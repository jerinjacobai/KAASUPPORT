import { X, Bell, Ticket, AlertCircle, Calendar } from 'lucide-react';
import { mockNotifications } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'ticket_update': return <Ticket className="w-4 h-4 text-blue-500" />;
      case 'sla_warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'assignment': return <Calendar className="w-4 h-4 text-emerald-500" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-[380px] h-full flex flex-col glass shadow-2xl border-l border-border bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="font-semibold text-lg">Notifications</h2>
          <p className="text-xs text-muted-foreground">You have 2 unread messages</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs font-medium text-primary hover:underline px-2">
            Mark all read
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex p-2 gap-1 border-b border-border">
        {['All', 'Unread', 'Tickets', 'System'].map(tab => (
          <button key={tab} className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
            tab === 'All' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {mockNotifications.map((notif) => (
          <div 
            key={notif.id}
            className={cn(
              "flex gap-3 p-4 border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer relative",
              !notif.read && "bg-primary/[0.02]"
            )}
          >
            {!notif.read && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
            
            <div className="mt-1 shrink-0 p-2 rounded-full bg-background border border-border">
              {getIcon(notif.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2 mb-1">
                <p className={cn("text-sm font-medium truncate", !notif.read && "text-primary")}>
                  {notif.title}
                </p>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                  {notif.time}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {notif.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-border text-center">
        <button className="text-sm font-medium text-primary hover:underline">
          View All Notifications
        </button>
      </div>
    </div>
  );
}
