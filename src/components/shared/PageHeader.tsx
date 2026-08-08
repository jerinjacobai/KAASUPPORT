import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-border animate-fade-in", className)}>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{title}</h1>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/50 border border-border/50 text-xs font-medium text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {currentTime}
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
