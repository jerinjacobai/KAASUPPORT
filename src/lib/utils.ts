import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTicketNumber(num: number): string {
  const year = new Date().getFullYear()
  return `TICK-${year}-${String(num).padStart(6, '0')}`
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    emergency: 'text-red-500 bg-red-500/10 border-red-500/20',
    critical: 'text-red-400 bg-red-400/10 border-red-400/20',
    high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    planning: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  }
  return colors[priority.toLowerCase()] || colors.medium
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'text-slate-400 bg-slate-400/10',
    submitted: 'text-blue-400 bg-blue-400/10',
    new: 'text-blue-300 bg-blue-300/10',
    accepted: 'text-cyan-400 bg-cyan-400/10',
    assigned: 'text-violet-400 bg-violet-400/10',
    acknowledged: 'text-purple-400 bg-purple-400/10',
    'engineer en route': 'text-amber-400 bg-amber-400/10',
    'arrived on site': 'text-orange-400 bg-orange-400/10',
    'in progress': 'text-yellow-400 bg-yellow-400/10',
    'waiting customer': 'text-orange-300 bg-orange-300/10',
    'waiting approval': 'text-yellow-300 bg-yellow-300/10',
    'waiting third party': 'text-amber-600 bg-amber-600/10',
    'waiting spare parts': 'text-amber-800 bg-amber-800/10',
    escalated: 'text-red-400 bg-red-400/10',
    resolved: 'text-emerald-400 bg-emerald-400/10',
    'verification pending': 'text-teal-400 bg-teal-400/10',
    'customer review': 'text-cyan-400 bg-cyan-400/10',
    closed: 'text-green-400 bg-green-400/10',
    cancelled: 'text-gray-400 bg-gray-400/10',
    reopened: 'text-rose-400 bg-rose-400/10',
    merged: 'text-purple-400 bg-purple-400/10',
    duplicate: 'text-gray-400 bg-gray-400/10',
  }
  return colors[status.toLowerCase()] || 'text-slate-400 bg-slate-400/10'
}
