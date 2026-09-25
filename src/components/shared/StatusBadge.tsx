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
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25';
      case 'in progress':
      case 'engineer en route':
      case 'arrived on site':
      case 'accepted':
      case 'assigned':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25';
      case 'waiting on customer':
      case 'waiting customer':
      case 'waiting approval':
      case 'waiting spare parts':
      case 'pending':
        return 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/25';
      case 'escalated':
      case 'reopened':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25';
      case 'resolved':
      case 'closed':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25';
      default:
        return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border", getStatusStyles(status), className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {formattedStatus}
    </span>
  );
}
