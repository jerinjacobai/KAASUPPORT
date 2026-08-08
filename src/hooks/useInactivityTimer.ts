import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

const INACTIVITY_TIMEOUT = 10 * 60 * 1000 // 10 minutes in milliseconds

export function useInactivityTimer() {
  const { user, signOut } = useAuthStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Only track inactivity if user is logged in
    if (!user) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        // Perform auto logout after 10 minutes of inactivity
        signOut()
        toast.warning('Session Expired', {
          description: 'You have been logged out due to 10 minutes of inactivity for security.'
        })
      }, INACTIVITY_TIMEOUT)
    }

    // Activity event listeners
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']

    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true })
    })

    // Start initial timer
    resetTimer()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [user, signOut])
}
