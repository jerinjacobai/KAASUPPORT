import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-border/80 animate-fade-in", className)}>
      <div className="min-w-0">
        <h1 className="text-[1.65rem] leading-tight font-semibold tracking-[-0.035em] text-foreground">{title}</h1>
        {description && (
          <p className="text-[13px] leading-relaxed text-muted-foreground mt-1.5 max-w-3xl">{description}</p>
        )}
      </div>
      
      {children && (
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {children}
        </div>
      )}
    </div>
  );
}
