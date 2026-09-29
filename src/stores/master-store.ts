import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { 
  DEFAULT_ROLE_PERMISSIONS, 
  MENU_DEFINITIONS 
} from '@/types/permissions'

export interface CompanyMaster {
  id: string
  name: string
  code: string
  industry: string
  email: string
  phone: string
  assetsCount: number
  usersCount: number
  is_active: boolean
  created_at?: string
}

export interface UserMaster {
  id: string
  name: string
  email: string
  roleType: 'KAA Internal Staff' | 'Client User'
  roleName: string
  mappedCompany: string
  status: 'Active' | 'Inactive'
  passwordHash?: string
  password?: string
  defaultPassword?: string
  isPasswordResetRequired?: boolean
  customPermissions?: string[]
  created_at?: string
}

export interface HardwareTypeMaster {
  id: string
  name: string
  code?: string
  description?: string
  icon?: string
  is_active?: boolean
  created_at?: string
}

export interface AssetMaster {
  id: string
  tag: string
  name: string
  company: string
  category: string
  model: string
  serial: string
  status: string
  amcStatus: string
  warrantyExpires: string
  assetUser?: string
  hardwareType?: string
  description?: string
  remarks?: string
  suggestion?: string
  provisionPath?: string
  created_at?: string
}

export interface AMCContractMaster {
  id: string
  contractNumber: string
  name: string
  company: string
  startDate: string
  endDate: string
  totalVisits: number
  usedVisits: number
  status: string
  includedLabor: boolean
  created_at?: string
}

export interface TicketAttachment {
  name: string
  url: string
  size?: number
  type?: string
}

export interface TicketMaster {
  id: string
  ticket_number?: string
  title: string
  description?: string
  company: string
  assetId?: string
  priority: string
  status: string
  category?: string
  assignee: {
    name: string
    avatar: string
  }
  attachments?: TicketAttachment[]
  createdAt?: string
  slaBreached?: boolean
}

export interface FieldVisitMaster {
  id: string
  ticketId: string
  ticketNumber?: string
  ticketTitle?: string
  engineerId?: string
  engineerName: string
  engineerAvatar?: string
  companyName: string
  location: string
  scheduledStart: string
  status: string
  GPSConfirmed?: boolean
  checkInTime?: string
  notes?: string
  customerSignature?: string
  customerSignerName?: string
  customerSignedAt?: string
  created_at?: string
}

export interface InventoryPartMaster {
  id: string
  sku: string
  name: string
  category: string
  location: string
  unitPrice: string
  stock: number
  minStock: number
  created_at?: string
}

export interface KBArticleMaster {
  id: string
  title: string
  category: string
  content?: string
  views: number
  helpful: number
  lastUpdated: string
  created_at?: string
}

interface MasterState {
  companies: CompanyMaster[]
  users: UserMaster[]
  hardwareTypes: HardwareTypeMaster[]
  assets: AssetMaster[]
  amcContracts: AMCContractMaster[]
  tickets: TicketMaster[]
  fieldVisits: FieldVisitMaster[]
  inventoryParts: InventoryPartMaster[]
  kbArticles: KBArticleMaster[]
  rolePermissions: Record<string, string[]>
  userPermissions: Record<string, string[]>
  isSyncing: boolean

  // Actions
  addCompany: (company: Omit<CompanyMaster, 'id' | 'assetsCount' | 'usersCount'> & { id?: string }) => Promise<CompanyMaster>
  updateCompany: (id: string, updates: Partial<CompanyMaster>) => void
  deleteCompany: (id: string) => Promise<void>

  addUser: (user: Omit<UserMaster, 'id'> & { id?: string }) => Promise<UserMaster>
  updateUser: (id: string, updates: Partial<UserMaster>) => void
  resetUserPassword: (id: string, newPassword?: string) => Promise<string>
  deleteUser: (id: string) => Promise<void>

  // Permissions & Access Actions
  updateRolePermissions: (roleName: string, menus: string[]) => Promise<void>
  updateUserPermissions: (userId: string, menus: string[]) => Promise<void>
  resetUserPermissions: (userId: string) => Promise<void>
  resetRolePermissionsToDefault: (roleName?: string) => Promise<void>
  getUserEffectivePermissions: (userOrId: UserMaster | string) => string[]
  hasUserMenuPermission: (userOrId: UserMaster | string | null | undefined, menuId: string) => boolean

  addHardwareType: (type: string | { name: string; code?: string; description?: string }) => Promise<HardwareTypeMaster>
  deleteHardwareType: (id: string) => Promise<void>

  addAsset: (asset: Omit<AssetMaster, 'id'> & { id?: string }) => Promise<AssetMaster>
  updateAsset: (id: string, updates: Partial<AssetMaster>) => Promise<void>
  deleteAsset: (id: string) => Promise<void>

  addAMCContract: (contract: Omit<AMCContractMaster, 'id' | 'contractNumber'> & { id?: string; contractNumber?: string }) => Promise<AMCContractMaster>
  updateAMCContract: (id: string, updates: Partial<AMCContractMaster>) => void

  addTicket: (ticket: Omit<TicketMaster, 'id'> & { id?: string }) => Promise<TicketMaster>
  updateTicket: (id: string, updates: Partial<TicketMaster>) => Promise<void>
  setTickets: (tickets: TicketMaster[]) => void

  addFieldVisit: (visit: Omit<FieldVisitMaster, 'id'> & { id?: string }) => Promise<FieldVisitMaster>
  updateFieldVisit: (id: string, updates: Partial<FieldVisitMaster>) => Promise<void>
  deleteFieldVisit: (id: string) => Promise<void>

  addInventoryPart: (part: Omit<InventoryPartMaster, 'id'> & { id?: string }) => Promise<InventoryPartMaster>
  updateInventoryPart: (id: string, updates: Partial<InventoryPartMaster>) => void
  reserveInventoryStock: (id: string, quantity?: number) => Promise<number>
  deleteInventoryPart: (id: string) => Promise<void>

  addKBArticle: (article: Omit<KBArticleMaster, 'id' | 'views' | 'helpful' | 'lastUpdated'> & { id?: string }) => Promise<KBArticleMaster>

  purgeMockData: () => void
  syncFromSupabase: () => Promise<void>
}

const isValidUUID = (str?: string): boolean => {
  return Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str))
}

const cleanMockFilter = <T extends { company?: string; mappedCompany?: string; title?: string; name?: string }>(items: T[]): T[] => {
  return (items || []).map(item => {
    const comp = item.company || item.mappedCompany || ''
    if (comp === 'KAA Client' || comp === 'International Technical Legacy') {
      return {
        ...item,
        ...(item.company !== undefined ? { company: 'ISS Global Forwarding W.L.L' } : {}),
        ...(item.mappedCompany !== undefined ? { mappedCompany: 'ISS Global Forwarding W.L.L' } : {})
      }
    }
    return item
  }).filter(item => {
    const comp = item.company || item.mappedCompany || ''
    const name = item.name || item.title || ''
    const isMockComp = ['Acme Corp', 'Globex Ltd', 'Initech Inc'].includes(comp)
    const isMockName = ['Siemens PLC input module failure on line 3', 'VFD overcurrent alarm trip during startup', 'Robotic arm calibration error after power restore', 'Alex Johnson', 'Priya Sharma', 'Robert Vance'].includes(name)
    return !isMockComp && !isMockName
  })
}

export const useMasterStore = create<MasterState>()(
  persist(
    (set, get) => ({
      companies: [] as CompanyMaster[],
      users: [] as UserMaster[],
      hardwareTypes: [] as HardwareTypeMaster[],
      assets: [] as AssetMaster[],
      amcContracts: [] as AMCContractMaster[],
      tickets: [] as TicketMaster[],
      fieldVisits: [] as FieldVisitMaster[],
      inventoryParts: [] as InventoryPartMaster[],
      kbArticles: [] as KBArticleMaster[],
      rolePermissions: { ...DEFAULT_ROLE_PERMISSIONS },
      userPermissions: {} as Record<string, string[]>,
      isSyncing: false,

      purgeMockData: () => {
        set((state) => ({
          companies: cleanMockFilter(state.companies),
          users: cleanMockFilter(state.users),
          assets: cleanMockFilter(state.assets),
          amcContracts: cleanMockFilter(state.amcContracts),
          tickets: cleanMockFilter(state.tickets),
          inventoryParts: cleanMockFilter(state.inventoryParts || []),
          kbArticles: cleanMockFilter(state.kbArticles || []),
        }))
      },

      addCompany: async (compData) => {
        const generatedCode = compData.code?.trim().toUpperCase() || compData.name.slice(0, 4).toUpperCase()
        const newCompany: CompanyMaster = {
          id: compData.id || `COMP-${Date.now()}`,
          name: compData.name.trim(),
          code: generatedCode,
          industry: compData.industry || 'Industrial Automation',
          email: compData.email || `contact@${compData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          phone: compData.phone || '+91 98000 11111',
          assetsCount: 0,
          usersCount: 0,
          is_active: compData.is_active ?? true,
          created_at: new Date().toISOString()
        }

        const { data, error } = await (supabase.from as any)('companies').insert({
          name: newCompany.name,
          code: newCompany.code,
          industry: newCompany.industry,
          email: newCompany.email,
          phone: newCompany.phone,
          is_active: newCompany.is_active
        }).select('id, created_at').single()

        if (error || !data) {
          throw new Error(error?.message || 'Could not save company in database.')
        }

        newCompany.id = data.id
        newCompany.created_at = data.created_at || newCompany.created_at

        set((state) => ({
          companies: [newCompany, ...state.companies]
        }))

        return newCompany
      },

      updateCompany: (id, updates) => {
        set((state) => ({
          companies: state.companies.map(c => c.id === id ? { ...c, ...updates } : c)
        }))

        ;(supabase.from as any)('companies').update(updates).eq('id', id).then(({ error }: any) => {
          if (error) console.warn('Supabase company update warning:', error.message)
        })
      },

      deleteCompany: async (id) => {
        const { data, error } = await (supabase.from as any)('companies')
          .update({ is_active: false }).eq('id', id).select('id').single()
        if (error || !data) throw new Error(error?.message || 'Company was not updated.')
        set((state) => ({
          companies: state.companies.map(company => company.id === id ? { ...company, is_active: false } : company)
        }))
      },

      addUser: async (userData) => {
        const generatedPassword = userData.password || userData.defaultPassword || `KaaPass2026!#`
        const normalizedEmail = userData.email.trim().toLowerCase()
        const selectedCompany = userData.roleType === 'KAA Internal Staff' 
          ? 'Global (All Companies)' 
          : (userData.mappedCompany || get().companies.find(c => c.is_active)?.name || 'KAA Client')

        const { data: rpcData, error: createError } = await (supabase.rpc as any)('admin_create_user', {
          p_email: normalizedEmail,
          p_password: generatedPassword,
          p_full_name: userData.name.trim(),
          p_role_type: userData.roleType,
          p_role_name: userData.roleName || (userData.roleType === 'KAA Internal Staff' ? 'Field Engineer' : 'Client Requester'),
          p_mapped_company: selectedCompany
        })

        if (createError) throw new Error(createError.message)

        const resolvedUserId = rpcData?.user_id || userData.id || `USER-${Date.now()}`

        const newUser: UserMaster = {
          id: resolvedUserId,
          name: userData.name.trim(),
          email: normalizedEmail,
          roleType: userData.roleType,
          roleName: userData.roleName || (userData.roleType === 'KAA Internal Staff' ? 'Field Engineer' : 'Client Requester'),
          mappedCompany: selectedCompany,
          status: userData.status || 'Active',
          passwordHash: userData.passwordHash,
          isPasswordResetRequired: true,
          created_at: new Date().toISOString()
        }

        set((state) => {
          const updatedCompanies = state.companies.map(c => 
            c.name.toLowerCase() === selectedCompany.toLowerCase() ? { ...c, usersCount: c.usersCount + 1 } : c
          )
          const filtered = state.users.filter(u => u.email.toLowerCase() !== normalizedEmail)
          return {
            users: [newUser, ...filtered],
            companies: updatedCompanies
          }
        })

        // Refresh directory asynchronously to confirm sync
        ;(supabase.rpc as any)('get_users_directory').then(({ data: dirData }: any) => {
          if (Array.isArray(dirData)) {
            const mappedUsers: UserMaster[] = dirData.map((u: any) => ({
              id: u.id,
              name: u.name || 'User',
              email: u.email,
              roleType: u.role_type as any,
              roleName: u.role_name || 'Requester',
              mappedCompany: u.mapped_company || 'Global (All Companies)',
              status: u.status === 'Active' ? 'Active' : 'Inactive',
              created_at: u.created_at
            }))
            set({ users: mappedUsers })
          }
        })

        return newUser
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map(u => u.id === id ? { ...u, ...updates } : u)
        }))

        if (updates.name || updates.status) {
          ;(supabase.from as any)('profiles').update({
            full_name: updates.name,
            is_active: updates.status === 'Active'
          }).eq('id', id).then(({ error }: any) => {
            if (error) console.warn('Supabase profile update warning:', error.message)
          })
        }
      },

      resetUserPassword: async (id, newPassword) => {
        const passwordToSet = newPassword || `KaaReset${Math.floor(1000 + Math.random() * 9000)}!`
        const foundUser = get().users.find(u => u.id === id)
        if (!foundUser) throw new Error('User was not found in the directory.')
        const { error } = await (supabase.rpc as any)('admin_create_user', {
          p_email: foundUser.email.toLowerCase(),
          p_password: passwordToSet,
          p_full_name: foundUser.name,
          p_role_type: foundUser.roleType,
          p_role_name: foundUser.roleName,
          p_mapped_company: foundUser.mappedCompany
        })
        if (error) throw new Error(error.message)

        set((state) => ({
          users: state.users.map(u => u.id === id ? { ...u, isPasswordResetRequired: true } : u)
        }))

        return passwordToSet
      },

      deleteUser: async (id) => {
        const { data, error } = await (supabase.from as any)('profiles')
          .update({ is_active: false }).eq('id', id).select('id').single()
        if (error || !data) throw new Error(error?.message || 'User was not deactivated.')
        set((state) => ({
          users: state.users.map(user => user.id === id ? { ...user, status: 'Inactive' } : user)
        }))
      },

      updateRolePermissions: async (roleName: string, menus: string[]) => {
        if (roleName === 'Super Admin') {
          // Super Admin retains whole admin scope (*), immutable
          return
        }
        set((state) => ({
          rolePermissions: {
            ...state.rolePermissions,
            [roleName]: menus
          }
        }))

        try {
          await (supabase.from as any)('roles')
            .update({ permissions: { menus } })
            .eq('display_name', roleName)
        } catch (err) {
          console.warn('Could not sync role permissions to Supabase:', err)
        }
      },

      updateUserPermissions: async (userId: string, menus: string[]) => {
        const foundUser = get().users.find(u => u.id === userId)
        if (foundUser?.roleName === 'Super Admin') {
          // Super Admin retains whole admin scope (*), immutable
          return
        }

        set((state) => ({
          userPermissions: {
            ...state.userPermissions,
            [userId]: menus
          },
          users: state.users.map(u => u.id === userId ? { ...u, customPermissions: menus } : u)
        }))

        try {
          if (isValidUUID(userId)) {
            await (supabase.from as any)('profiles')
              .update({ custom_permissions: { menus } })
              .eq('id', userId)
          }
        } catch (err) {
          console.warn('Could not sync user permissions to Supabase:', err)
        }
      },

      resetUserPermissions: async (userId: string) => {
        set((state) => {
          const next = { ...state.userPermissions }
          delete next[userId]
          return {
            userPermissions: next,
            users: state.users.map(u => u.id === userId ? { ...u, customPermissions: undefined } : u)
          }
        })

        try {
          if (isValidUUID(userId)) {
            await (supabase.from as any)('profiles')
              .update({ custom_permissions: null })
              .eq('id', userId)
          }
        } catch (err) {
          console.warn('Could not reset user permissions in Supabase:', err)
        }
      },

      resetRolePermissionsToDefault: async (roleName?: string) => {
        if (roleName) {
          if (roleName === 'Super Admin') return
          const defaultMenus = DEFAULT_ROLE_PERMISSIONS[roleName] || MENU_DEFINITIONS.map(m => m.id)
          set((state) => ({
            rolePermissions: {
              ...state.rolePermissions,
              [roleName]: defaultMenus
            }
          }))

          try {
            await (supabase.from as any)('roles')
              .update({ permissions: { menus: defaultMenus } })
              .eq('display_name', roleName)
          } catch (err) {
            console.warn('Could not reset role permissions in Supabase:', err)
          }
        } else {
          set({ rolePermissions: { ...DEFAULT_ROLE_PERMISSIONS } })
          for (const [rName, defaultMenus] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
            try {
              await (supabase.from as any)('roles')
                .update({ permissions: { menus: defaultMenus } })
                .eq('display_name', rName)
            } catch {
              // ignore
            }
          }
        }
      },

      getUserEffectivePermissions: (userOrId: UserMaster | string): string[] => {
        let user: UserMaster | undefined
        if (typeof userOrId === 'string') {
          user = get().users.find(u => u.id === userOrId || u.email.toLowerCase() === userOrId.toLowerCase())
        } else {
          user = userOrId
        }

        if (!user) return MENU_DEFINITIONS.map(m => m.id)
        if (user.roleName === 'Super Admin') return MENU_DEFINITIONS.map(m => m.id)

        const userOverride = get().userPermissions[user.id]
        if (userOverride && Array.isArray(userOverride) && userOverride.length > 0) {
          return userOverride
        }

        const rolePerms = get().rolePermissions[user.roleName]
        if (rolePerms && Array.isArray(rolePerms)) {
          return rolePerms
        }

        return DEFAULT_ROLE_PERMISSIONS[user.roleName] || ['dashboard', 'tickets', 'knowledge_base']
      },

      hasUserMenuPermission: (userOrId: UserMaster | string | null | undefined, menuId: string): boolean => {
        if (!userOrId) return false
        const effective = get().getUserEffectivePermissions(userOrId)
        return effective.includes(menuId)
      },

      addHardwareType: async (input: string | { name: string; code?: string; description?: string }) => {
        const name = typeof input === 'string' ? input : input.name
        const code = typeof input === 'object' ? input.code : undefined
        const description = typeof input === 'object' ? input.description : undefined
        const trimmed = name.trim()
        if (!trimmed) throw new Error('Hardware type name cannot be empty.')
        const existing = get().hardwareTypes.find(h => h.name.toLowerCase() === trimmed.toLowerCase())
        if (existing) return existing

        const newType: HardwareTypeMaster = {
          id: `HW-${Date.now()}`,
          name: trimmed,
          code: code || trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 10),
          description: description || `${trimmed} Hardware`,
          is_active: true,
          created_at: new Date().toISOString()
        }

        const { data, error } = await (supabase.from as any)('asset_categories').insert({
          name: trimmed,
          is_active: true
        }).select('id, created_at').single()

        if (!error && data) {
          newType.id = data.id
          newType.created_at = data.created_at || newType.created_at
        }

        set((state) => ({
          hardwareTypes: [...state.hardwareTypes, newType]
        }))

        return newType
      },

      deleteHardwareType: async (id: string) => {
        set((state) => ({
          hardwareTypes: state.hardwareTypes.filter(h => h.id !== id)
        }))
        if (isValidUUID(id)) {
          await (supabase.from as any)('asset_categories').delete().eq('id', id)
        }
      },

      addAsset: async (assetData) => {
        const resolvedHardwareType = assetData.hardwareType || assetData.category || 'Machinery'
        const newAsset: AssetMaster = {
          id: assetData.id || '',
          tag: assetData.tag || `AST-2026-${Math.floor(100 + Math.random() * 900)}`,
          name: assetData.name.trim(),
          company: assetData.company,
          category: resolvedHardwareType,
          model: assetData.model || 'Standard Unit',
          serial: assetData.serial || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
          status: assetData.status || 'Active',
          amcStatus: assetData.amcStatus || 'Active AMC',
          warrantyExpires: assetData.warrantyExpires || '2027-12-31',
          assetUser: assetData.assetUser || '',
          hardwareType: resolvedHardwareType,
          description: assetData.description || '',
          remarks: assetData.remarks || '',
          suggestion: assetData.suggestion || '',
          provisionPath: assetData.provisionPath || '',
          created_at: new Date().toISOString()
        }

        // Match company from store or fetch
        const targetCompName = newAsset.company.trim().toLowerCase()
        let company = get().companies.find(c => c.name.toLowerCase() === targetCompName || c.code.toLowerCase() === targetCompName)
        if (!company) {
          const { data: dbComp } = await (supabase.from as any)('companies')
            .select('id, name').or(`name.ilike.${targetCompName},code.ilike.${targetCompName}`).limit(1).maybeSingle()
          if (dbComp) company = dbComp
        }

        if (!company?.id) {
          throw new Error(`Company "${newAsset.company}" was not found. Please onboard or select a valid client company first.`)
        }

        const { data: insertedAsset, error: insertError } = await (supabase.from as any)('assets').insert({
          company_id: company.id,
          company_name: company.name,
          asset_tag: newAsset.tag,
          name: newAsset.name,
          model: newAsset.model,
          serial_number: newAsset.serial,
          status: 'active',
          asset_user: newAsset.assetUser,
          hardware_type: newAsset.hardwareType,
          description: newAsset.description,
          remarks: newAsset.remarks,
          suggestion: newAsset.suggestion,
          provision_path: newAsset.provisionPath
        }).select('id, created_at').single()

        if (insertError || !insertedAsset) {
          throw new Error(insertError?.message || 'Could not save asset in database.')
        }

        newAsset.id = insertedAsset.id
        newAsset.created_at = insertedAsset.created_at || newAsset.created_at
        set((state) => ({
          assets: [newAsset, ...state.assets],
          companies: state.companies.map(c => c.id === company.id ? { ...c, assetsCount: c.assetsCount + 1 } : c)
        }))

        return newAsset
      },

      updateAsset: async (id, updates) => {
        // Map frontend camelCase to Postgres snake_case
        const dbPayload: Record<string, any> = {}
        if (updates.name !== undefined) dbPayload.name = updates.name
        if (updates.model !== undefined) dbPayload.model = updates.model
        if (updates.status !== undefined) dbPayload.status = (updates.status || 'active').toLowerCase()
        if (updates.tag !== undefined) dbPayload.asset_tag = updates.tag
        if (updates.serial !== undefined) dbPayload.serial_number = updates.serial
        if (updates.assetUser !== undefined) dbPayload.asset_user = updates.assetUser
        if (updates.hardwareType !== undefined) dbPayload.hardware_type = updates.hardwareType
        if (updates.remarks !== undefined) dbPayload.remarks = updates.remarks
        if (updates.description !== undefined) dbPayload.description = updates.description
        if (updates.suggestion !== undefined) dbPayload.suggestion = updates.suggestion
        if (updates.company !== undefined) {
          dbPayload.company_name = updates.company
          const comp = get().companies.find(c => c.name.toLowerCase() === updates.company?.toLowerCase() || c.code.toLowerCase() === updates.company?.toLowerCase())
          if (comp?.id && isValidUUID(comp.id)) {
            dbPayload.company_id = comp.id
          }
        }
        dbPayload.updated_at = new Date().toISOString()

        set((state) => ({
          assets: state.assets.map(a => a.id === id ? { ...a, ...updates } : a)
        }))

        if (isValidUUID(id)) {
          const { error } = await (supabase.from as any)('assets').update(dbPayload).eq('id', id)
          if (error) {
            console.error('Supabase asset update error:', error.message)
            throw new Error(error.message)
          }
        }
      },

      deleteAsset: async (id) => {
        const { error } = await (supabase.from as any)('assets').delete().eq('id', id)
        if (error) throw new Error(error.message)
        set((state) => ({
          assets: state.assets.filter(a => a.id !== id)
        }))
      },

      addAMCContract: async (contractData) => {
        const nextNum = 100 + get().amcContracts.length + 1
        const contractNumber = contractData.contractNumber || `AMC-2026-${nextNum}`
        const newContract: AMCContractMaster = {
          id: contractData.id || `AMC-${nextNum}`,
          contractNumber: contractNumber,
          name: contractData.name,
          company: contractData.company,
          startDate: contractData.startDate || new Date().toISOString().split('T')[0],
          endDate: contractData.endDate || '2027-12-31',
          totalVisits: Number(contractData.totalVisits) || 12,
          usedVisits: Number(contractData.usedVisits) || 0,
          status: contractData.status || 'Active',
          includedLabor: contractData.includedLabor ?? true,
          created_at: new Date().toISOString()
        }

        const matchedComp = get().companies.find(c => c.name === newContract.company)
        if (!matchedComp) throw new Error(`Company "${newContract.company}" was not found. Select a valid client company.`)

        const { data, error } = await (supabase.from as any)('amc_contracts').insert({
          company_id: matchedComp.id,
          contract_number: newContract.contractNumber,
          name: newContract.name,
          start_date: newContract.startDate,
          end_date: newContract.endDate,
          total_visits: newContract.totalVisits,
          used_visits: newContract.usedVisits,
          status: newContract.status.toLowerCase(),
          included_labor: newContract.includedLabor
        }).select('id, contract_number, created_at').single()

        if (error || !data) throw new Error(error?.message || 'Could not save AMC contract.')
        newContract.id = data.id
        newContract.contractNumber = data.contract_number || newContract.contractNumber
        newContract.created_at = data.created_at
        set((state) => ({ amcContracts: [newContract, ...state.amcContracts] }))

        return newContract
      },

      updateAMCContract: (id, updates) => {
        set((state) => ({
          amcContracts: state.amcContracts.map(c => c.id === id ? { ...c, ...updates } : c)
        }))

        ;(supabase.from as any)('amc_contracts').update(updates).eq('id', id).then(({ error }: any) => {
          if (error) console.warn('Supabase amc_contracts update warning:', error.message)
        })
      },

      addTicket: async (ticketData) => {
        const nextIdNum = 1001 + get().tickets.length
        const ticketId = ticketData.id || `TKT-${nextIdNum}`
        const matchedComp = get().companies.find(c => 
          c.name.toLowerCase() === (ticketData.company || '').toLowerCase() || 
          c.code.toLowerCase() === (ticketData.company || '').toLowerCase()
        )

        // Resolve valid UUID for asset_id if selected
        let resolvedAssetId: string | null = null
        if (ticketData.assetId) {
          if (isValidUUID(ticketData.assetId)) {
            resolvedAssetId = ticketData.assetId
          } else {
            const matchedAsset = get().assets.find(a => a.id === ticketData.assetId || a.tag === ticketData.assetId)
            if (matchedAsset?.id && isValidUUID(matchedAsset.id)) {
              resolvedAssetId = matchedAsset.id
            }
          }
        }

        const newTicket: TicketMaster = {
          id: ticketId,
          ticket_number: ticketId,
          title: ticketData.title,
          description: ticketData.description || 'No detailed description provided.',
          company: ticketData.company,
          assetId: ticketData.assetId || '',
          priority: ticketData.priority || 'medium',
          status: ticketData.status || 'open',
          category: ticketData.category || 'Hardware',
          assignee: ticketData.assignee || { name: 'Unassigned', avatar: '' },
          attachments: ticketData.attachments || [],
          createdAt: new Date().toISOString(),
          slaBreached: false
        }

        if (!matchedComp) throw new Error(`Company "${ticketData.company}" was not found. Select a valid client company.`)

        const { data, error } = await (supabase.from as any)('tickets').insert({
          ticket_number: newTicket.ticket_number,
          title: newTicket.title,
          description: newTicket.description,
          source: 'portal',
          contact_name: newTicket.company,
          company_id: matchedComp.id,
          asset_id: resolvedAssetId,
          priority: newTicket.priority,
          status: newTicket.status,
          category: newTicket.category,
          created_at: newTicket.createdAt
        }).select('id, ticket_number, created_at').single()

        if (error || !data) throw new Error(error?.message || 'Could not save ticket.')
        newTicket.id = data.ticket_number || data.id
        newTicket.ticket_number = data.ticket_number || newTicket.id
        newTicket.createdAt = data.created_at || newTicket.createdAt

        // If attachments exist, insert into public.ticket_attachments
        if (newTicket.attachments && newTicket.attachments.length > 0 && isValidUUID(data.id)) {
          const rows = newTicket.attachments.map(att => ({
            ticket_id: data.id,
            file_name: att.name,
            file_size: att.size || 0,
            storage_path: att.url,
            created_at: new Date().toISOString()
          }))
          ;(supabase.from as any)('ticket_attachments').insert(rows).then(({ error }: any) => {
            if (error) console.warn('Supabase ticket_attachments insert note:', error.message)
          })
        }

        set((state) => ({ tickets: [newTicket, ...state.tickets] }))
        return newTicket
      },

      updateTicket: async (id, updates) => {
        const { data, error } = await (supabase.from as any)('tickets')
          .update(updates).or(`ticket_number.eq.${id},id.eq.${id}`).select('id').single()
        if (error || !data) throw new Error(error?.message || 'Ticket was not updated.')
        set((state) => ({
          tickets: state.tickets.map(t => (t.id === id || t.ticket_number === id) ? { ...t, ...updates } : t)
        }))
      },

      setTickets: (tickets) => set({ tickets }),

      addFieldVisit: async (visitData) => {
        const nextId = (get().fieldVisits || []).length + 1
        const newVisit: FieldVisitMaster = {
          id: visitData.id || `VISIT-${nextId}`,
          ticketId: visitData.ticketId,
          ticketNumber: visitData.ticketNumber || visitData.ticketId,
          ticketTitle: visitData.ticketTitle || 'On-site maintenance',
          engineerId: visitData.engineerId,
          engineerName: visitData.engineerName,
          engineerAvatar: visitData.engineerAvatar || '',
          companyName: visitData.companyName,
          location: visitData.location,
          scheduledStart: visitData.scheduledStart || 'Today, 02:00 PM',
          status: visitData.status || 'En Route',
          GPSConfirmed: visitData.GPSConfirmed ?? true,
          checkInTime: visitData.checkInTime || '01:55 PM',
          notes: visitData.notes || '',
          customerSignature: visitData.customerSignature || '',
          customerSignerName: visitData.customerSignerName || '',
          customerSignedAt: visitData.customerSignedAt || '',
          created_at: new Date().toISOString()
        }

        // Find real ticket UUID if available
        const matchedTicket = get().tickets.find(t => t.id === newVisit.ticketId || t.ticket_number === newVisit.ticketId)
        const ticketUUID = matchedTicket?.id && isValidUUID(matchedTicket.id) ? matchedTicket.id : null

        const { data, error } = await (supabase.from as any)('field_visits').insert({
          ticket_id: ticketUUID,
          status: newVisit.status,
          notes: `${newVisit.companyName} | ${newVisit.location} | Ticket: ${newVisit.ticketId} | Engineer: ${newVisit.engineerName}`,
          scheduled_date: new Date().toISOString().split('T')[0],
          created_at: newVisit.created_at
        }).select('id, created_at').single()

        if (!error && data) {
          newVisit.id = data.id
          newVisit.created_at = data.created_at || newVisit.created_at
        }

        set((state) => ({ fieldVisits: [newVisit, ...(state.fieldVisits || [])] }))
        return newVisit
      },

      updateFieldVisit: async (id, updates) => {
        set((state) => ({
          fieldVisits: (state.fieldVisits || []).map(v => v.id === id ? { ...v, ...updates } : v)
        }))

        if (isValidUUID(id)) {
          await (supabase.from as any)('field_visits').update({
            status: updates.status,
            notes: updates.notes
          }).eq('id', id)
        }
      },

      deleteFieldVisit: async (id) => {
        set((state) => ({
          fieldVisits: (state.fieldVisits || []).filter(v => v.id !== id)
        }))
        if (isValidUUID(id)) {
          await (supabase.from as any)('field_visits').delete().eq('id', id)
        }
      },

      addInventoryPart: async (partData) => {
        const nextId = (get().inventoryParts || []).length + 1
        const newPart: InventoryPartMaster = {
          id: partData.id || `PRT-${nextId}`,
          sku: partData.sku || `PRT-${Math.floor(1000 + Math.random() * 9000)}`,
          name: partData.name,
          category: partData.category || 'Hardware',
          location: partData.location || 'Central Warehouse, Zone A',
          unitPrice: partData.unitPrice.startsWith('₹') ? partData.unitPrice : `₹${partData.unitPrice}`,
          stock: Number(partData.stock) || 10,
          minStock: Number(partData.minStock) || 2,
          created_at: new Date().toISOString()
        }

        const { data, error } = await (supabase.from as any)('parts').insert({
          name: newPart.name,
          sku: newPart.sku,
          unit_price: Number(newPart.unitPrice.replace(/[^0-9.]/g, '')) || 0,
          min_stock_level: newPart.minStock
        }).select('id, created_at').single()
        if (error || !data) throw new Error(error?.message || 'Could not save spare part.')
        newPart.id = data.id
        newPart.created_at = data.created_at || newPart.created_at

        set((state) => ({ inventoryParts: [newPart, ...(state.inventoryParts || [])] }))
        return newPart
      },

      updateInventoryPart: (id, updates) => {
        set((state) => ({
          inventoryParts: (state.inventoryParts || []).map(p => p.id === id ? { ...p, ...updates } : p)
        }))

        ;(supabase.from as any)('parts').update(updates).eq('id', id).then(({ error }: any) => {
          if (error) console.warn('Supabase parts update warning:', error.message)
        })
      },

      reserveInventoryStock: async (id, quantity = 1) => {
        const part = get().inventoryParts.find(item => item.id === id)
        if (!part) throw new Error('Part not found.')
        if (part.stock < quantity) throw new Error('Insufficient stock.')
        const remainingStock = part.stock - quantity
        set((state) => ({
          inventoryParts: (state.inventoryParts || []).map(item => item.id === id ? { ...item, stock: remainingStock } : item)
        }))
        return remainingStock
      },

      deleteInventoryPart: async (id) => {
        const { error } = await (supabase.from as any)('parts').delete().eq('id', id)
        if (error) throw new Error(error.message)
        set((state) => ({
          inventoryParts: (state.inventoryParts || []).filter(part => part.id !== id)
        }))
      },

      addKBArticle: async (articleData) => {
        const newArticle: KBArticleMaster = {
          id: articleData.id || `KB-${Date.now()}`,
          title: articleData.title,
          category: articleData.category || 'Hardware',
          content: articleData.content || '',
          views: 1,
          helpful: 100,
          lastUpdated: 'Just now',
          created_at: new Date().toISOString()
        }

        const { data, error } = await (supabase.from as any)('kb_articles').insert({
          title: newArticle.title,
          content: newArticle.content,
          is_published: true
        }).select('id, created_at').single()
        if (error || !data) throw new Error(error?.message || 'Could not save KB article.')

        newArticle.id = data.id
        newArticle.created_at = data.created_at
        set((state) => ({ kbArticles: [newArticle, ...(state.kbArticles || [])] }))

        return newArticle
      },

      syncFromSupabase: async () => {
        try {
          set({ isSyncing: true })

          // 1. Sync Live Tickets
          const { data: dbTickets } = await (supabase.from as any)('tickets').select('*')
          if (dbTickets) {
            const mappedDbTickets: TicketMaster[] = dbTickets.map((t: any) => ({
              id: t.ticket_number || t.id,
              ticket_number: t.ticket_number || t.id,
              title: t.title || 'Support Request',
              description: t.description || '',
              company: t.contact_name && t.contact_name !== 'KAA Client' && t.contact_name !== 'International Technical Legacy' ? t.contact_name : 'ISS Global Forwarding W.L.L',
              priority: t.priority || 'medium',
              status: t.status || 'open',
              category: t.category || 'General',
              assignee: { name: 'Unassigned', avatar: '' },
              createdAt: t.created_at || new Date().toISOString()
            }))

            set({ tickets: mappedDbTickets })
          }

          // 2. Sync Live Companies
          const { data: dbCompanies } = await (supabase.from as any)('companies').select('*')
          if (Array.isArray(dbCompanies)) {
            const mappedDbCompanies: CompanyMaster[] = dbCompanies.map((c: any) => ({
              id: c.id,
              name: c.name,
              code: c.code || c.name.slice(0, 4).toUpperCase(),
              industry: c.industry || 'Industrial Automation',
              email: c.email || '',
              phone: c.phone || '',
              assetsCount: 0,
              usersCount: 0,
              is_active: c.is_active ?? true,
              created_at: c.created_at
            }))
            set({ companies: mappedDbCompanies })
          }

          // 3. Sync Live Users Directory
          const { data: dbUsers, error: usersError } = await (supabase.rpc as any)('get_users_directory')
          if (usersError) {
            console.warn('Supabase users directory sync warning:', usersError.message)
          } else if (Array.isArray(dbUsers)) {
            const mappedUsers: UserMaster[] = dbUsers.map((u: any) => ({
              id: u.id,
              name: u.name || 'User',
              email: u.email,
              roleType: u.role_type as any,
              roleName: u.role_name || 'Requester',
              mappedCompany: u.mapped_company || 'Global (All Companies)',
              status: u.status === 'Active' ? 'Active' : 'Inactive',
              created_at: u.created_at
            }))
            set({ users: mappedUsers })
          }

          // 4. Sync Hardware Types (asset_categories)
          const { data: dbHWTypes } = await (supabase.from as any)('asset_categories').select('*').order('name')
          if (Array.isArray(dbHWTypes) && dbHWTypes.length > 0) {
            const mappedHW: HardwareTypeMaster[] = dbHWTypes.map((hw: any) => ({
              id: hw.id,
              name: hw.name,
              icon: hw.icon,
              is_active: hw.is_active ?? true,
              created_at: hw.created_at
            }))
            set({ hardwareTypes: mappedHW })
          }

          // 5. Sync Live Assets
          const { data: dbAssets } = await (supabase.from as any)('assets').select('*, companies(id, name)')
          if (Array.isArray(dbAssets)) {
            const currentComps = get().companies
            const mappedAssets: AssetMaster[] = dbAssets.map((a: any) => {
              const matchedComp = a.company_name || a.companies?.name || currentComps.find((company: CompanyMaster) => company.id === a.company_id)?.name || 'ISS Global Forwarding W.L.L'
              const resolvedComp = (matchedComp === 'KAA Client' || matchedComp === 'International Technical Legacy') ? 'ISS Global Forwarding W.L.L' : matchedComp
              
              const rawStatus = a.status || 'Active'
              const displayStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()

              return {
                id: a.id,
                tag: a.asset_tag || `AST-${a.id.slice(0, 6)}`,
                name: a.name,
                company: resolvedComp,
                category: a.hardware_type || 'Machinery',
                model: a.model || 'Standard Unit',
                serial: a.serial_number || 'N/A',
                status: displayStatus,
                amcStatus: 'Active AMC',
                warrantyExpires: '2027-12-31',
                assetUser: a.asset_user || '',
                hardwareType: a.hardware_type || 'Machinery',
                description: a.description || '',
                remarks: a.remarks || '',
                suggestion: a.suggestion || '',
                provisionPath: a.provision_path || '',
                created_at: a.created_at
              }
            })
            set({ assets: mappedAssets })
          }

          // 6. Sync Live AMC Contracts
          const { data: dbContracts } = await (supabase.from as any)('amc_contracts').select('*')
          if (Array.isArray(dbContracts)) {
            const currentComps = get().companies
            const mappedContracts: AMCContractMaster[] = dbContracts.map((c: any) => {
              const matchedComp = currentComps.find((company: CompanyMaster) => company.id === c.company_id)?.name || 'ISS Global Forwarding W.L.L'
              const resolvedComp = (matchedComp === 'KAA Client' || matchedComp === 'International Technical Legacy') ? 'ISS Global Forwarding W.L.L' : matchedComp
              return {
                id: c.id,
                contractNumber: c.contract_number || `AMC-${c.id.slice(0, 6)}`,
                name: c.name,
                company: resolvedComp,
                startDate: c.start_date || '2026-01-01',
                endDate: c.end_date || '2026-12-31',
                totalVisits: c.total_visits || 12,
                usedVisits: c.used_visits || 0,
                status: c.status || 'Active',
                includedLabor: c.included_labor ?? true,
                created_at: c.created_at
              }
            })
            set({ amcContracts: mappedContracts })
          }

          // 7. Update Company Counts Dynamically
          set((state) => ({
            companies: state.companies.map(c => ({
              ...c,
              assetsCount: state.assets.filter(a => a.company === c.name).length,
              usersCount: state.users.filter(u => u.mappedCompany === c.name).length
            }))
          }))

          // 7. Sync Field Visits
          const { data: dbVisits } = await (supabase.from as any)('field_visits').select('*').order('created_at', { ascending: false })
          if (Array.isArray(dbVisits) && dbVisits.length > 0) {
            const currentTickets = get().tickets
            const currentUsers = get().users
            const mappedVisits: FieldVisitMaster[] = dbVisits.map((v: any) => {
              const matchedTicket = currentTickets.find(t => t.id === v.ticket_id || t.ticket_number === v.ticket_id)
              const matchedEngineer = currentUsers.find(u => u.id === v.engineer_id)
              
              // Extract notes parsing if encoded
              let company = matchedTicket?.company || 'Client Site'
              let location = 'Client Site'
              if (v.notes && v.notes.includes('|')) {
                const parts = v.notes.split('|').map((s: string) => s.trim())
                if (parts[0]) company = parts[0]
                if (parts[1]) location = parts[1]
              }

              return {
                id: v.id,
                ticketId: matchedTicket?.ticket_number || matchedTicket?.id || v.ticket_id || 'TKT-1001',
                ticketNumber: matchedTicket?.ticket_number || v.ticket_id,
                ticketTitle: matchedTicket?.title || 'On-site maintenance',
                engineerId: v.engineer_id,
                engineerName: matchedEngineer?.name || 'Assigned Field Engineer',
                engineerAvatar: '',
                companyName: company,
                location: location,
                scheduledStart: v.scheduled_date ? `${v.scheduled_date}, 02:00 PM` : 'Today, 02:00 PM',
                status: v.status || 'En Route',
                GPSConfirmed: Boolean(v.check_in_location || v.check_in_time),
                checkInTime: v.check_in_time ? new Date(v.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '01:55 PM',
                notes: v.notes || '',
                created_at: v.created_at
              }
            })
            set({ fieldVisits: mappedVisits })
          }

          // 8. Sync Live Spare Parts
          const { data: dbParts } = await (supabase.from as any)('parts').select('*')
          const { data: dbStockLevels } = await (supabase.from as any)('stock_levels').select('*')
          const { data: dbWarehouses } = await (supabase.from as any)('warehouses').select('id, name')
          const { data: dbPartCategories } = await (supabase.from as any)('part_categories').select('id, name')
          if (Array.isArray(dbParts)) {
            const mappedParts: InventoryPartMaster[] = dbParts.map((p: any) => ({
              id: p.id,
              sku: p.sku,
              name: p.name,
              category: dbPartCategories?.find((category: any) => category.id === p.category_id)?.name || 'Hardware',
              location: dbWarehouses?.find((warehouse: any) => warehouse.id === dbStockLevels?.find((level: any) => level.part_id === p.id)?.warehouse_id)?.name || 'Unassigned warehouse',
              unitPrice: `₹${p.unit_price || '0'}`,
              stock: dbStockLevels?.filter((level: any) => level.part_id === p.id).reduce((sum: number, level: any) => sum + (Number(level.available_quantity ?? level.quantity) || 0), 0) || 0,
              minStock: p.min_stock_level || 2,
              created_at: p.created_at
            }))
            set({ inventoryParts: mappedParts })
          }

          // 9. Sync Live KB Articles
          const { data: dbArticles } = await (supabase.from as any)('kb_articles').select('*')
          if (Array.isArray(dbArticles)) {
            const mappedArticles: KBArticleMaster[] = dbArticles.map((a: any) => ({
              id: a.id,
              title: a.title,
              category: 'Hardware',
              content: a.content,
              views: a.view_count || 1,
              helpful: a.helpful_count || 100,
              lastUpdated: 'Recently',
              created_at: a.created_at
            }))
            set({ kbArticles: mappedArticles })
          }

          // 10. Sync Live Roles & Menu Permissions
          try {
            const { data: dbRoles } = await (supabase.from as any)('roles').select('name, display_name, permissions')
            if (Array.isArray(dbRoles) && dbRoles.length > 0) {
              const currentRolePerms = { ...get().rolePermissions }
              for (const r of dbRoles) {
                if (r.display_name && r.permissions?.menus && Array.isArray(r.permissions.menus)) {
                  currentRolePerms[r.display_name] = r.permissions.menus
                }
              }
              set({ rolePermissions: currentRolePerms })
            }
          } catch (rErr) {
            console.warn('Roles permissions sync warning:', rErr)
          }

          // 11. Sync Live User Custom Permissions
          try {
            const { data: dbProfiles } = await (supabase.from as any)('profiles').select('id, custom_permissions')
            if (Array.isArray(dbProfiles) && dbProfiles.length > 0) {
              const currentUserPerms = { ...get().userPermissions }
              for (const p of dbProfiles) {
                if (p.id && p.custom_permissions?.menus && Array.isArray(p.custom_permissions.menus)) {
                  currentUserPerms[p.id] = p.custom_permissions.menus
                }
              }
              set({ 
                userPermissions: currentUserPerms,
                users: get().users.map(u => ({
                  ...u,
                  customPermissions: currentUserPerms[u.id] || u.customPermissions
                }))
              })
            }
          } catch (pErr) {
            console.warn('Profiles custom permissions sync warning:', pErr)
          }
        } catch (err) {
          console.warn('Sync error from Supabase:', err)
        } finally {
          set({ isSyncing: false })
        }
      }
    }),
    {
      name: 'kaa-master-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        companies: state.companies,
        users: state.users,
        hardwareTypes: state.hardwareTypes,
        assets: state.assets,
        amcContracts: state.amcContracts,
        tickets: state.tickets,
        fieldVisits: state.fieldVisits,
        inventoryParts: state.inventoryParts,
        kbArticles: state.kbArticles,
        rolePermissions: state.rolePermissions,
        userPermissions: state.userPermissions,
      }),
    }
  )
)
