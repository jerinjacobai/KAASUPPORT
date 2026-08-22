import { supabase } from '@/lib/supabase'
import { useMasterStore } from '@/stores/master-store'

export async function fetchTickets(isKaaInternal: boolean, userCompany: string | null) {
  try {
    const { data, error } = await supabase.from('tickets').select('*')
    const storeTickets = useMasterStore.getState().tickets

    const dbMapped = (!error && data && data.length > 0) ? data.map((t: any) => ({
      id: t.ticket_number || t.id,
      ticket_number: t.ticket_number || t.id,
      title: t.title || 'Support Request',
      description: t.description || '',
      company: t.contact_name || 'KAA Client',
      priority: t.priority || 'medium',
      status: t.status || 'open',
      category: t.category || 'General',
      assignee: { name: 'Unassigned', avatar: '' },
      createdAt: t.created_at || new Date().toISOString()
    })) : []

    // Merge store & db tickets
    const allMap = new Map()
    storeTickets.forEach(t => allMap.set(t.id || t.ticket_number, t))
    dbMapped.forEach((t: any) => allMap.set(t.id || t.ticket_number, t))
    const combined = Array.from(allMap.values())

    const normalize = (s?: string) => (s || '').trim().toLowerCase()
    const targetComp = normalize(userCompany || '')

    return combined.filter((t: any) => {
      if (isKaaInternal || !targetComp) return true
      const ticketComp = normalize(t.company || t.contact_name || '')
      return ticketComp === targetComp || ticketComp.includes(targetComp) || targetComp.includes(ticketComp)
    })
  } catch {
    const normalize = (s?: string) => (s || '').trim().toLowerCase()
    const targetComp = normalize(userCompany || '')
    return useMasterStore.getState().tickets.filter((t: any) => {
      if (isKaaInternal || !targetComp) return true
      const ticketComp = normalize(t.company || t.contact_name || '')
      return ticketComp === targetComp || ticketComp.includes(targetComp) || targetComp.includes(ticketComp)
    })
  }
}

export async function createTicket(ticketData: {
  title: string
  description?: string
  priority: string
  category?: string
  company: string
  assetId?: string
}) {
  return useMasterStore.getState().addTicket({
    title: ticketData.title,
    description: ticketData.description || '',
    company: ticketData.company,
    priority: ticketData.priority,
    category: ticketData.category || 'General',
    assetId: ticketData.assetId,
    status: 'open',
    assignee: { name: 'Unassigned', avatar: '' }
  })
}
