import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const normalized = priority.toLowerCase();
  
  let icon = <ArrowDown className="w-3 h-3" />;
  let styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let isPulsing = false;
  
  if (normalized === 'medium') {
    icon = <ArrowUp className="w-3 h-3" />;
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (normalized === 'high') {
    icon = <AlertTriangle className="w-3 h-3" />;
    styles = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
  } else if (normalized === 'critical' || normalized === 'emergency') {
    icon = <AlertCircle className="w-3 h-3" />;
    styles = 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold';
    isPulsing = true;
  }

  const formattedPriority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border relative shadow-sm",
      styles,
      className
    )}>
      {isPulsing && (
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
        </span>
      )}
      <span className={isPulsing ? "ml-1.5" : ""}>{icon}</span>
      {formattedPriority}
    </span>
  );
}
