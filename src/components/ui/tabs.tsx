import * as React from 'react'
import { cn } from '@/lib/utils'

const TabsContext = React.createContext<{
  activeTab: string
  setActiveTab: (val: string) => void
} | null>(null)

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (val: string) => void
}

export function Tabs({ defaultValue = 'companies', value, onValueChange, children, className, ...props }: TabsProps) {
  const [internalTab, setInternalTab] = React.useState(defaultValue)
  const activeTab = value !== undefined ? value : internalTab

  const setActiveTab = (val: string) => {
    if (value === undefined) {
      setInternalTab(val)
    }
    onValueChange?.(val)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-zinc-900/50 p-1 text-zinc-400',
        className
      )}
      {...props}
    />
  )
)
TabsList.displayName = 'TabsList'

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const ctx = React.useContext(TabsContext)
    if (!ctx) return null

    const isActive = ctx.activeTab === value

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => ctx.setActiveTab(value)}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          isActive
            ? 'bg-zinc-800 text-zinc-100 shadow-sm'
            : 'hover:bg-zinc-800/50 hover:text-zinc-200',
          className
        )}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const ctx = React.useContext(TabsContext)
    if (!ctx || ctx.activeTab !== value) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        className={cn(
          'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in',
          className
        )}
        {...props}
      />
    )
  }
)
TabsContent.displayName = 'TabsContent'
