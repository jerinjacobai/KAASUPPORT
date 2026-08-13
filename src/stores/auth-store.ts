import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { useMasterStore } from '@/stores/master-store'

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (!error && session) {
            const isInternal = session.user.email?.endsWith('@kaasupport.com') || 
                               session.user.email?.endsWith('@kaa-erp.com') || 
                               session.user.user_metadata?.is_kaa_internal;

            set({
              session,
              user: session.user,
              isKaaInternal: !!isInternal,
              roles: isInternal ? ['super_admin', 'internal'] : ['client_admin'],
              permissions: ['*'],
              userCompany: session.user.user_metadata?.company || get().userCompany || null,
              isLoading: false,
            })
          } else if (!get().user) {
            set({ user: null, session: null, isLoading: false })
          }
        } catch {
          // If offline or network glitch, preserve persisted user session
          set({ isLoading: false })
        }
      },

      signIn: async (email, password) => {
        try {
          // 1. Try Supabase Auth
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (!error && data?.user) {
            const isInternal = email.endsWith('@kaasupport.com') || email.endsWith('@kaa-erp.com') || data.user?.user_metadata?.is_kaa_internal;
            
            set({ 
              user: data.user, 
              session: data.session,
              isKaaInternal: !!isInternal,
              roles: isInternal ? ['super_admin', 'internal'] : ['client_admin'],
              permissions: ['*'],
              userCompany: data.user?.user_metadata?.company || null,
              isLoading: false
            })
            
            return { error: null }
          }

          // 2. Fallback to Master Store created users
          const masterUsers = useMasterStore.getState().users;
          const foundMasterUser = masterUsers.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            (u.password === password || u.defaultPassword === password) &&
            u.status === 'Active'
          );

          if (foundMasterUser) {
            const isInternal = foundMasterUser.roleType === 'KAA Internal Staff';
            const userObj: any = {
              id: foundMasterUser.id,
              email: foundMasterUser.email,
              user_metadata: {
                full_name: foundMasterUser.name,
                company: foundMasterUser.mappedCompany,
                is_kaa_internal: isInternal
              }
            };

            set({
              user: userObj,
              session: { user: userObj } as any,
              isKaaInternal: isInternal,
              roles: isInternal ? ['super_admin', 'internal'] : ['client_admin'],
              permissions: ['*'],
              userCompany: isInternal ? null : foundMasterUser.mappedCompany,
              isLoading: false
            });

            return { error: null };
          }

          return { error: error || new Error('Invalid email or password.') };
        } catch (err: any) {
          return { error: err };
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
    }),
    {
      name: 'kaa-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        roles: state.roles,
        permissions: state.permissions,
        isKaaInternal: state.isKaaInternal,
        userCompany: state.userCompany,
      }),
    }
  )
)
