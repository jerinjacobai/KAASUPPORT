import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  subtitle?: string;
  className?: string;
  index?: number;
}

export function KPICard({ title, value, change, trend = 'neutral', icon: Icon, subtitle, className, index }: KPICardProps) {
  
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (trend === 'down') return "text-destructive bg-destructive/10 border-destructive/20";
    return "text-muted-foreground bg-secondary/50 border-border/30";
  };

  return (
    <div 
      className={cn("glass relative overflow-hidden rounded-xl p-5 transition-shadow duration-200 hover:shadow-lg hover:shadow-black/10 group animate-card-enter", className)}
      style={{ '--stagger': index || 0 } as React.CSSProperties}
    >
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</h3>
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/15 shrink-0">
          <Icon className="w-[18px] h-[18px]" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-3">
        <span className="text-[1.85rem] font-semibold tracking-tight text-foreground">{value}</span>
        
        {change !== undefined && (
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", getTrendColor())}>
            {getTrendIcon()}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">{subtitle}</p>
      )}
    </div>
  );
}
