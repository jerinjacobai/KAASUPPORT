import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-primary/20 bg-primary/10 text-primary',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-destructive/20 bg-destructive/10 text-destructive',
        outline: 'text-muted-foreground border-border',
        success: 'border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        warning: 'border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        info: 'border-blue-600/20 bg-blue-500/10 text-blue-700 dark:text-blue-300',
        'priority-critical': 'border-destructive/20 bg-destructive/10 text-destructive',
        'priority-high': 'border-orange-600/20 bg-orange-500/10 text-orange-700 dark:text-orange-300',
        'priority-medium': 'border-yellow-600/20 bg-yellow-500/10 text-yellow-800 dark:text-yellow-300',
        'priority-low': 'border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
