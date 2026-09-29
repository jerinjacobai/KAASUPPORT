import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { useMasterStore } from '@/stores/master-store'
import { hashPassword } from '@/lib/crypto'
import { 
  DEFAULT_ROLE_PERMISSIONS, 
  getRoleInfo, 
  type RoleTier 
} from '@/types/permissions'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  roles: string[]
  roleName: string | null
  roleTier: RoleTier
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
  setRoleName: (roleName: string | null) => void
  setPermissions: (permissions: string[]) => void
  setCompanyIds: (ids: string[]) => void
  setUserCompany: (company: string | null) => void
  setActiveCompanyId: (id: string | null) => void
  setIsLoading: (loading: boolean) => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  hasMenuAccess: (menuId: string) => boolean
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
      roleName: null,
      roleTier: 'user',
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
      setRoleName: (roleName) => {
        const roleInfo = getRoleInfo(roleName)
        set({ roleName, roleTier: roleInfo.tier })
      },
      setPermissions: (permissions) => set({ permissions }),
      setCompanyIds: (companyIds) => set({ companyIds }),
      setUserCompany: (userCompany) => set({ userCompany }),
      setActiveCompanyId: (activeCompanyId) => set({ activeCompanyId }),
      setIsLoading: (isLoading) => set({ isLoading }),

      hasPermission: (permission) => get().permissions.includes('*') || get().permissions.includes(permission),
      hasRole: (role) => get().roles.includes(role),

      hasMenuAccess: (menuId: string): boolean => {
        const state = get()
        const user = state.user
        const roleName = state.roleName
        const isInternal = state.isKaaInternal

        // 1. Super Admin: Always unrestricted whole admin scope (*)
        if (
          state.roleTier === 'super_admin' || 
          roleName === 'Super Admin' ||
          state.roles.includes('super_admin') ||
          user?.email?.toLowerCase() === 'admin@kaasupport.com' ||
          user?.email?.toLowerCase() === 'qataritl037@gmail.com'
        ) {
          return true
        }

        // 2. Check individual user-specific custom permissions override
        if (user?.id) {
          const userOverrides = useMasterStore.getState().userPermissions[user.id]
          if (Array.isArray(userOverrides) && userOverrides.length > 0) {
            return userOverrides.includes(menuId)
          }
        }

        // 3. Check active role permissions configured in masterStore
        if (roleName) {
          const configuredRolePerms = useMasterStore.getState().rolePermissions[roleName]
          if (Array.isArray(configuredRolePerms)) {
            return configuredRolePerms.includes(menuId)
          }
          // Default role fallback
          const defaultPerms = DEFAULT_ROLE_PERMISSIONS[roleName]
          if (Array.isArray(defaultPerms)) {
            return defaultPerms.includes(menuId)
          }
        }

        // 4. Fallback: Base minimal access
        if (isInternal) {
          return ['dashboard', 'tickets', 'knowledge_base'].includes(menuId)
        }
        return ['dashboard', 'tickets', 'tickets_new', 'knowledge_base'].includes(menuId)
      },

      checkSession: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (!error && session) {
            const isInternal = session.user.email?.endsWith('@kaasupport.com') || 
                               session.user.email?.endsWith('@kaa-erp.com') || 
                               session.user.email?.toLowerCase() === 'qataritl037@gmail.com' ||
                               session.user.user_metadata?.is_kaa_internal;

            let resolvedCompany = session.user.user_metadata?.company || get().userCompany || null;
            if (resolvedCompany === 'International Technical Legacy' || resolvedCompany === 'KAA Client') {
              resolvedCompany = 'ISS Global Forwarding W.L.L';
            }
            if (!resolvedCompany && !isInternal) {
              const { data: dbComp } = await (supabase.rpc as any)('get_user_company');
              if (dbComp) resolvedCompany = dbComp;
            }

            // Match directory user for role
            const masterUser = useMasterStore.getState().users.find(
              u => u.email.toLowerCase() === session.user.email?.toLowerCase() || u.id === session.user.id
            );
            const resolvedRoleName = session.user.user_metadata?.role_name || masterUser?.roleName || (isInternal ? 'Super Admin' : 'Client Requester');
            const roleInfo = getRoleInfo(resolvedRoleName);

            set({
              session,
              user: session.user,
              isKaaInternal: !!isInternal,
              roles: roleInfo.tier === 'super_admin' ? ['super_admin', 'internal'] : (isInternal ? ['internal', 'admin'] : ['client_user']),
              roleName: resolvedRoleName,
              roleTier: roleInfo.tier,
              permissions: roleInfo.tier === 'super_admin' ? ['*'] : (useMasterStore.getState().rolePermissions[resolvedRoleName] || []),
              userCompany: resolvedCompany,
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

      signIn: async (rawEmail, rawPassword) => {
        const email = rawEmail.trim().toLowerCase();
        const password = rawPassword.trim();
        try {
          // 1. Try Supabase Auth
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (!error && data?.user) {
            const isInternal = email.endsWith('@kaasupport.com') || 
                               email.endsWith('@kaa-erp.com') || 
                               email === 'qataritl037@gmail.com' ||
                               data.user?.user_metadata?.is_kaa_internal;
            
            let resolvedCompany = data.user?.user_metadata?.company || null;
            if (resolvedCompany === 'International Technical Legacy' || resolvedCompany === 'KAA Client') {
              resolvedCompany = 'ISS Global Forwarding W.L.L';
            }
            if (!resolvedCompany && !isInternal) {
              const { data: dbComp } = await (supabase.rpc as any)('get_user_company');
              if (dbComp) resolvedCompany = dbComp;
            }

            const masterUser = useMasterStore.getState().users.find(
              u => u.email.toLowerCase() === email || u.id === data.user.id
            );
            const resolvedRoleName = data.user.user_metadata?.role_name || masterUser?.roleName || (isInternal ? 'Super Admin' : 'Client Requester');
            const roleInfo = getRoleInfo(resolvedRoleName);

            set({ 
              user: data.user, 
              session: data.session,
              isKaaInternal: !!isInternal,
              roles: roleInfo.tier === 'super_admin' ? ['super_admin', 'internal'] : (isInternal ? ['internal', 'admin'] : ['client_user']),
              roleName: resolvedRoleName,
              roleTier: roleInfo.tier,
              permissions: roleInfo.tier === 'super_admin' ? ['*'] : (useMasterStore.getState().rolePermissions[resolvedRoleName] || []),
              userCompany: resolvedCompany,
              isLoading: false
            })
            
            return { error: null }
          }

          // 2. Fallback to Master Store created users using cryptographic hash comparison
          const masterUsers = useMasterStore.getState().users;
          const enteredHash = await hashPassword(password);

          const foundMasterUser = masterUsers.find(u => {
            if (u.email.toLowerCase() !== email || u.status !== 'Active') {
              return false;
            }
            return u.passwordHash === enteredHash || 
                   u.password === password || 
                   u.defaultPassword === password;
          });

          if (foundMasterUser) {
            // Auto-upgrade record to hashed format if it had plaintext password
            if (!foundMasterUser.passwordHash) {
              useMasterStore.getState().updateUser(foundMasterUser.id, {
                passwordHash: enteredHash,
                password: '',
                defaultPassword: ''
              });
            }

            const isInternal = foundMasterUser.roleType === 'KAA Internal Staff';
            const resolvedRoleName = foundMasterUser.roleName || (isInternal ? 'Super Admin' : 'Client Requester');
            const roleInfo = getRoleInfo(resolvedRoleName);

            const userObj: any = {
              id: foundMasterUser.id,
              email: foundMasterUser.email,
              user_metadata: {
                full_name: foundMasterUser.name,
                company: foundMasterUser.mappedCompany,
                is_kaa_internal: isInternal,
                role_name: resolvedRoleName,
                role_type: foundMasterUser.roleType
              }
            };

            set({
              user: userObj,
              session: { user: userObj } as any,
              isKaaInternal: isInternal,
              roles: roleInfo.tier === 'super_admin' ? ['super_admin', 'internal'] : (isInternal ? ['internal', 'admin'] : ['client_user']),
              roleName: resolvedRoleName,
              roleTier: roleInfo.tier,
              permissions: roleInfo.tier === 'super_admin' ? ['*'] : (useMasterStore.getState().rolePermissions[resolvedRoleName] || []),
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
        roleName: null,
        roleTier: 'user',
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
        roleName: state.roleName,
        roleTier: state.roleTier,
        permissions: state.permissions,
        isKaaInternal: state.isKaaInternal,
        userCompany: state.userCompany,
      }),
    }
  )
)
