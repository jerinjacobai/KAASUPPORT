import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTickets, createTicket } from '@/services/ticketService'
import { useAuthStore } from '@/stores/auth-store'

export function useTickets() {
  const { isKaaInternal, userCompany } = useAuthStore()

  return useQuery({
    queryKey: ['tickets', isKaaInternal, userCompany],
    queryFn: () => fetchTickets(isKaaInternal, userCompany),
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}
