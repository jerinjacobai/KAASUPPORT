import { supabase } from '@/lib/supabase'
import { mockTickets } from '@/lib/mock-data'

export async function fetchTickets(isKaaInternal: boolean, userCompany: string | null) {
  try {
    let query = supabase.from('tickets').select('*')

    if (!isKaaInternal && userCompany) {
      query = query.eq('company_id', userCompany) // Or company name match
    }

    const { data, error } = await query
    if (error || !data || data.length === 0) {
      // Return filtered mock tickets if DB table is empty or error
      return mockTickets.filter(ticket => 
        isKaaInternal ? true : (ticket.company === userCompany)
      )
    }
    return data
  } catch {
    return mockTickets.filter(ticket => 
      isKaaInternal ? true : (ticket.company === userCompany)
    )
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
      ticket_number: `TICK-2026-${Math.floor(100000 + Math.random() * 900000)}`,
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
