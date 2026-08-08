import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, Ticket, AlertCircle, Calendar, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { mockNotifications as initialNotifications } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState<'All' | 'Unread' | 'Tickets' | 'System'>('All');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.info('Notification history cleared');
  };

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    // Mark clicked item as read
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    
    // Navigate based on type
    if (notif.title.includes('TKT-') || notif.description.includes('TKT-')) {
      const match = notif.title.match(/TKT-\d+/) || notif.description.match(/TKT-\d+/);
      const ticketId = match ? match[0] : 'TKT-1000';
      navigate(`/tickets/${ticketId}`);
    } else {
      navigate('/tickets');
    }
    onClose();
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'ticket_update': return <Ticket className="w-4 h-4 text-primary" />;
      case 'sla_warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'assignment': return <Calendar className="w-4 h-4 text-emerald-500" />;
      default: return <Bell className="w-4 h-4 text-violet-400" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'Unread') return !n.read;
    if (activeTab === 'Tickets') return n.type === 'ticket_update' || n.type === 'assignment' || n.type === 'sla_warning';
    if (activeTab === 'System') return n.type === 'system';
    return true;
  });

  return (
    <div className="w-full sm:w-[400px] h-full flex flex-col glass shadow-2xl border-l border-border bg-card text-card-foreground animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base tracking-tight text-foreground">Notifications</h2>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-2 gap-1 border-b border-border bg-secondary/10">
        {(['All', 'Unread', 'Tickets', 'System'] as const).map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5",
              activeTab === tab 
                ? "bg-primary text-primary-foreground shadow-sm font-bold" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {tab}
            {tab === 'Unread' && unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-extrabold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification Content List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/50">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-muted-foreground">
            <Bell className="w-10 h-10 mb-2 opacity-30 text-primary" />
            <p className="text-sm font-medium">No notifications in {activeTab}</p>
            <p className="text-xs text-muted-foreground/80 mt-1">Updates and alerts will appear here in real-time.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={cn(
                "flex gap-3 p-4 hover:bg-secondary/40 transition-all cursor-pointer relative group",
                !notif.read && "bg-primary/[0.04]"
              )}
            >
              {!notif.read && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
              
              <div className="mt-0.5 shrink-0 p-2 rounded-xl bg-secondary/80 border border-border group-hover:border-primary/40 transition-colors">
                {getIcon(notif.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <p className={cn("text-xs font-semibold truncate", !notif.read ? "text-foreground font-bold" : "text-muted-foreground")}>
                    {notif.title}
                  </p>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                    {notif.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {notif.description}
                </p>
              </div>

              <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all self-center shrink-0" />
            </div>
          ))
        )}
      </div>
      
      {/* Panel Footer */}
      <div className="p-3 border-t border-border flex items-center justify-between bg-secondary/20">
        <button 
          onClick={handleClearAll}
          disabled={notifications.length === 0}
          className="text-xs font-medium text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All
        </button>
        <button 
          onClick={() => {
            handleMarkAllRead();
            toast.info('Showing all ticket alerts');
            navigate('/tickets');
            onClose();
          }}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          View Support Tickets →
        </button>
      </div>
    </div>
  );
}
