import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (s: string) => {
    const normalized = s.toLowerCase().replace(/_/g, ' ');
    
    switch (normalized) {
      case 'open':
      case 'new':
      case 'submitted':
      case 'draft':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'in progress':
      case 'engineer en route':
      case 'arrived on site':
      case 'accepted':
      case 'assigned':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'waiting on customer':
      case 'waiting customer':
      case 'waiting approval':
      case 'waiting spare parts':
      case 'pending':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'escalated':
      case 'reopened':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse';
      case 'resolved':
      case 'closed':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm", getStatusStyles(status), className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {formattedStatus}
    </span>
  );
}
