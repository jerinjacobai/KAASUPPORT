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
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (trend === 'down') return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    return "text-zinc-400 bg-zinc-800/50 border-zinc-700/30";
  };

  return (
    <div className={cn("glass rounded-xl p-5 hover:border-primary/40 transition-all duration-300 group shadow-lg", className)}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</h3>
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0 group-hover:scale-105 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
        
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border", getTrendColor())}>
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
