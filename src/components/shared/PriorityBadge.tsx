import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const normalized = priority.toLowerCase();
  
  let icon = <ArrowDown className="w-3 h-3" />;
  let styles = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25';
  
  if (normalized === 'medium') {
    icon = <ArrowUp className="w-3 h-3" />;
    styles = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25';
  } else if (normalized === 'high') {
    icon = <AlertTriangle className="w-3 h-3" />;
    styles = 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/25';
  } else if (normalized === 'critical' || normalized === 'emergency') {
    icon = <AlertCircle className="w-3 h-3" />;
    styles = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25';
  }

  const formattedPriority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border",
      styles,
      className
    )}>
      {icon}
      {formattedPriority}
    </span>
  );
}
