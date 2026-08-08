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
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'in progress':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'waiting on customer':
      case 'pending':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'resolved':
      case 'closed':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusStyles(status), className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {formattedStatus}
    </span>
  );
}
