import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-10 text-center", className)}>
      <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-4 text-primary border border-primary/15">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground max-w-md mb-6">{description}</p>
      
      {action && (
        <button 
          onClick={action.onClick}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/15"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
