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
  activeCompanyId: string | null
  isLoading: boolean
  isKaaInternal: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setRoles: (roles: string[]) => void
  setPermissions: (permissions: string[]) => void
  setCompanyIds: (ids: string[]) => void
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
  roles: ['super_admin', 'internal'],
  permissions: ['*'],
  companyIds: [],
  activeCompanyId: null,
  isLoading: false,
  isKaaInternal: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setRoles: (roles) => set({ roles, isKaaInternal: roles.includes('internal') || roles.includes('super_admin') }),
  setPermissions: (permissions) => set({ permissions }),
  setCompanyIds: (companyIds) => set({ companyIds }),
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
          isLoading: false,
        })
      } else {
        // Mock default user for demo if not logged in
        const mockUser: User = {
          id: 'demo-user-id',
          app_metadata: {},
          user_metadata: { full_name: 'Jacob Admin' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: 'admin@kaa.com',
        }
        set({
          user: mockUser,
          roles: ['super_admin', 'internal'],
          isKaaInternal: true,
          isLoading: false,
        })
      }
    } catch {
      // Fallback for demo when Supabase URL is placeholder
      const mockUser: User = {
        id: 'demo-user-id',
        app_metadata: {},
        user_metadata: { full_name: 'Jacob Admin' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: 'admin@kaa.com',
      }
      set({
        user: mockUser,
        roles: ['super_admin', 'internal'],
        isKaaInternal: true,
        isLoading: false,
      })
    }
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        // Fallback for demo
        const mockUser: User = {
          id: 'demo-user-id',
          app_metadata: {},
          user_metadata: { full_name: email.split('@')[0] },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email,
        }
        set({
          user: mockUser,
          roles: ['super_admin', 'internal'],
          isKaaInternal: true,
          isLoading: false,
        })
        return { error: null }
      }
      set({ user: data.user, session: data.session })
      return { error: null }
    } catch {
      const mockUser: User = {
        id: 'demo-user-id',
        app_metadata: {},
        user_metadata: { full_name: email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email,
      }
      set({
        user: mockUser,
        roles: ['super_admin', 'internal'],
        isKaaInternal: true,
        isLoading: false,
      })
      return { error: null }
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
    activeCompanyId: null,
    isLoading: false,
    isKaaInternal: false,
  }),
}))
