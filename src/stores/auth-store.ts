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
  signIn: (email: string, password: string, isClientLogin?: boolean, companyName?: string) => Promise<{ error: Error | null }>
  loginAsAdmin: () => void
  loginAsClient: (companyName?: string) => void
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
  userCompany: null, // Null for admin (sees all), or 'Acme Corp' for client
  activeCompanyId: null,
  isLoading: false,
  isKaaInternal: true,

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
          isLoading: false,
        })
      } else {
        // Default to Admin session if none saved
        get().loginAsAdmin()
      }
    } catch {
      get().loginAsAdmin()
    }
  },

  signIn: async (email, password, isClientLogin = false, companyName = 'Acme Corp') => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (isClientLogin) {
          get().loginAsClient(companyName)
        } else {
          get().loginAsAdmin()
        }
        return { error: null }
      }
      set({ user: data.user, session: data.session })
      return { error: null }
    } catch {
      if (isClientLogin) {
        get().loginAsClient(companyName)
      } else {
        get().loginAsAdmin()
      }
      return { error: null }
    }
  },

  loginAsAdmin: () => {
    const mockAdmin: User = {
      id: 'kaa-admin-id',
      app_metadata: {},
      user_metadata: { full_name: 'KAA Super Admin' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'admin@kaa-erp.com',
    }
    set({
      user: mockAdmin,
      roles: ['super_admin', 'internal'],
      permissions: ['*'],
      isKaaInternal: true,
      userCompany: null, // Sees all companies
      isLoading: false,
    })
  },

  loginAsClient: (companyName = 'Acme Corp') => {
    const mockClientUser: User = {
      id: 'client-user-id',
      app_metadata: {},
      user_metadata: { full_name: 'John Doe (Client Admin)', company: companyName },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: `support@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    }
    set({
      user: mockClientUser,
      roles: ['client_admin', 'client'],
      permissions: ['client.tickets.read', 'client.tickets.create', 'client.assets.read'],
      isKaaInternal: false,
      userCompany: companyName, // Locked to mapped company!
      isLoading: false,
    })
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
    isKaaInternal: false,
  }),
}))
