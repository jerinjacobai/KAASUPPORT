import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

const DropdownMenuContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  anchor: HTMLElement | null
  setAnchor: (element: HTMLElement) => void
} | null>(null)

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen, anchor, setAnchor }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const ctx = React.useContext(DropdownMenuContext)
  
  if (asChild && React.isValidElement(children)) {
    const childElement = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
    return React.cloneElement(childElement, {
      onClick: (e: React.MouseEvent) => {
        childElement.props.onClick?.(e)
        if (!ctx) return
        ctx.setAnchor(e.currentTarget as HTMLElement)
        ctx.setIsOpen(!ctx.isOpen)
      },
    })
  }

  return (
    <button onClick={(e) => {
      if (!ctx) return
      ctx.setAnchor(e.currentTarget)
      ctx.setIsOpen(!ctx.isOpen)
    }}>
      {children}
    </button>
  )
}

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'center' | 'end' }>(
  ({ className, align = 'end', children, ...props }, ref) => {
    const ctx = React.useContext(DropdownMenuContext)
    const contentRef = React.useRef<HTMLDivElement | null>(null)
    const [position, setPosition] = React.useState<React.CSSProperties>({ top: 0, left: 0, visibility: 'hidden' })

    React.useLayoutEffect(() => {
      if (!ctx?.isOpen || !ctx.anchor || !contentRef.current) return
      const updatePosition = () => {
        if (!ctx.anchor || !contentRef.current) return
        const triggerRect = ctx.anchor.getBoundingClientRect()
        const menuRect = contentRef.current.getBoundingClientRect()
        const below = window.innerHeight - triggerRect.bottom
        const top = below >= menuRect.height + 8 || triggerRect.top < menuRect.height + 8
          ? triggerRect.bottom + 8
          : triggerRect.top - menuRect.height - 8
        const rawLeft = align === 'end'
          ? triggerRect.right - menuRect.width
          : align === 'center'
            ? triggerRect.left + (triggerRect.width - menuRect.width) / 2
            : triggerRect.left
        setPosition({
          position: 'fixed',
          top: Math.max(8, Math.min(top, window.innerHeight - menuRect.height - 8)),
          left: Math.max(8, Math.min(rawLeft, window.innerWidth - menuRect.width - 8)),
          visibility: 'visible'
        })
      }
      updatePosition()
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition, true)
      return () => {
        window.removeEventListener('resize', updatePosition)
        window.removeEventListener('scroll', updatePosition, true)
      }
    }, [ctx?.isOpen, ctx?.anchor, align, children])

    if (!ctx?.isOpen || typeof document === 'undefined') return null

    return createPortal(
      <>
        <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => ctx.setIsOpen(false)} />
        <div
          {...props}
          ref={(node) => {
            contentRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          style={{ ...position, ...props.style, zIndex: 9999 }}
          className={cn(
            'min-w-[8rem] max-h-[calc(100vh-1rem)] overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950/95 backdrop-blur-md p-1 text-zinc-100 shadow-md animate-in fade-in-0 zoom-in-95',
            className
          )}
        >
          {children}
        </div>
      </>,
      document.body
    )
  }
)
DropdownMenuContent.displayName = 'DropdownMenuContent'

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const ctx = React.useContext(DropdownMenuContext)
    return (
      <div
        ref={ref}
        onClick={(e) => {
          props.onClick?.(e)
          ctx?.setIsOpen(false)
        }}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-zinc-800 focus:bg-zinc-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)
DropdownMenuItem.displayName = 'DropdownMenuItem'

export const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-2 py-1.5 text-sm font-semibold text-zinc-400', className)}
      {...props}
    />
  )
)
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

export const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-zinc-800', className)}
      {...props}
    />
  )
)
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'
