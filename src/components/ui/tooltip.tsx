import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  delayMs?: number
  className?: string
}

export function Tooltip({ content, children, delayMs = 300, className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delayMs)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className={cn("absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 px-3 py-1.5 text-xs text-zinc-100 bg-zinc-800 border border-zinc-700 rounded-md shadow-md animate-in fade-in zoom-in-95 pointer-events-none whitespace-nowrap", className)}>
          {content}
        </div>
      )}
    </div>
  )
}
