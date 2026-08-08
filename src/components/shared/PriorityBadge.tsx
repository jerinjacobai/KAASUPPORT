import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const normalized = priority.toLowerCase();
  
  let icon = <ArrowDown className="w-3 h-3" />;
  let styles = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  let isPulsing = false;
  
  if (normalized === 'medium') {
    icon = <ArrowUp className="w-3 h-3" />;
    styles = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  } else if (normalized === 'high') {
    icon = <AlertTriangle className="w-3 h-3" />;
    styles = 'bg-orange-500/10 text-orange-500 border-orange-500/20';
  } else if (normalized === 'critical' || normalized === 'emergency') {
    icon = <AlertCircle className="w-3 h-3" />;
    styles = 'bg-destructive/10 text-destructive border-destructive/20';
    isPulsing = true;
  }

  const formattedPriority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border relative",
      styles,
      className
    )}>
      {isPulsing && (
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
        </span>
      )}
      <span className={isPulsing ? "ml-1.5" : ""}>{icon}</span>
      {formattedPriority}
    </span>
  );
}
