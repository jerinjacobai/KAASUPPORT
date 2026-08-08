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
}

export function KPICard({ title, value, change, trend = 'neutral', icon: Icon, subtitle, className }: KPICardProps) {
  
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return "text-success bg-success/10";
    if (trend === 'down') return "text-destructive bg-destructive/10";
    return "text-muted-foreground bg-muted";
  };

  return (
    <div className={cn("glass rounded-xl p-5 hover:border-primary/30 transition-all duration-300 group", className)}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</h3>
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium", getTrendColor())}>
            {getTrendIcon()}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-3">{subtitle}</p>
      )}
    </div>
  );
}
