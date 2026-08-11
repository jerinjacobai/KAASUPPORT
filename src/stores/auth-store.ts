import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  roles: string[]
  permissions: string[]
  companyIds: string[]
  userCompany: string | null
  activeCompanyId: string | null
  isLoading: boolean
  isKaaInternal: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setRoles: (roles: string[]) => void
  setPermissions: (permissions: string[]) => void
  setCompanyIds: (ids: string[]) => void
  setUserCompany: (company: string | null) => void
  setActiveCompanyId: (id: string | null) => void
  setIsLoading: (loading: boolean) => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  checkSession: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  reset: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  roles: [],
  permissions: [],
  companyIds: [],
  userCompany: null,
  activeCompanyId: null,
  isLoading: false,
  isKaaInternal: true, // Default KAA staff perspective

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setRoles: (roles) => set({ roles, isKaaInternal: roles.includes('internal') || roles.includes('super_admin') }),
  setPermissions: (permissions) => set({ permissions }),
  setCompanyIds: (companyIds) => set({ companyIds }),
  setUserCompany: (userCompany) => set({ userCompany }),
  setActiveCompanyId: (activeCompanyId) => set({ activeCompanyId }),
  setIsLoading: (isLoading) => set({ isLoading }),

  hasPermission: (permission) => get().permissions.includes('*') || get().permissions.includes(permission),
  hasRole: (role) => get().roles.includes(role),

  checkSession: async () => {
    set({ isLoading: true })
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      if (session) {
        set({
          session,
          user: session.user,
          isKaaInternal: true,
          roles: ['super_admin', 'internal'],
          permissions: ['*'],
          isLoading: false,
        })
      } else {
        set({ user: null, session: null, isLoading: false })
      }
    } catch {
      set({ user: null, session: null, isLoading: false })
    }
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        return { error }
      }
      
      const isInternal = email.endsWith('@kaasupport.com') || email.endsWith('@kaa-erp.com') || data.user?.user_metadata?.is_kaa_internal;
      
      set({ 
        user: data.user, 
        session: data.session,
        isKaaInternal: !!isInternal,
        roles: isInternal ? ['super_admin', 'internal'] : ['client_admin'],
        permissions: ['*'],
        userCompany: data.user?.user_metadata?.company || null
      })
      
      return { error: null }
    } catch (err: any) {
      return { error: err }
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // ignore
    }
    get().reset()
  },

  reset: () => set({
    user: null,
    session: null,
    profile: null,
    roles: [],
    permissions: [],
    companyIds: [],
    userCompany: null,
    activeCompanyId: null,
    isLoading: false,
    isKaaInternal: true,
  }),
}))
