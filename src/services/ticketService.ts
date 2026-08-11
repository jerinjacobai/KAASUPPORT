import { supabase } from '@/lib/supabase'
import { useMasterStore } from '@/stores/master-store'

export async function fetchTickets(isKaaInternal: boolean, userCompany: string | null) {
  try {
    const { data, error } = await supabase.from('tickets').select('*')
    const storeTickets = useMasterStore.getState().tickets

    if (!error && data && data.length > 0) {
      const dbMapped = data.map((t: any) => ({
        id: t.ticket_number || t.id,
        ticket_number: t.ticket_number || t.id,
        title: t.title || 'Support Request',
        description: t.description || '',
        company: t.contact_name || 'KAA Client',
        priority: t.priority || 'medium',
        status: t.status || 'open',
        category: t.category || 'General',
        assignee: { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=1' },
        createdAt: t.created_at || new Date().toISOString()
      }))

      // Merge store & db tickets
      const allMap = new Map()
      storeTickets.forEach(t => allMap.set(t.id, t))
      dbMapped.forEach((t: any) => allMap.set(t.id, t))
      const combined = Array.from(allMap.values())

      return combined.filter(t => isKaaInternal ? true : t.company === userCompany)
    }

    return storeTickets.filter(t => isKaaInternal ? true : t.company === userCompany)
  } catch {
    return useMasterStore.getState().tickets.filter(t => isKaaInternal ? true : t.company === userCompany)
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
  try {
    const { data, error } = await supabase.from('tickets').insert([{
      ticket_number: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      title: ticketData.title,
      description: ticketData.description || '',
      source: 'portal',
      contact_name: ticketData.company,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }] as any).select().single()

    if (error) {
      console.warn('Supabase insert note:', error.message)
    }
    return data || { id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`, ...ticketData }
  } catch {
    return { id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`, ...ticketData }
  }
}
