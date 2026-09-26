import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

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
  hardwareType?: 'Laptops' | 'Monitor'
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
  createdAt?: string
  slaBreached?: boolean
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
  assets: AssetMaster[]
  amcContracts: AMCContractMaster[]
  tickets: TicketMaster[]
  inventoryParts: InventoryPartMaster[]
  kbArticles: KBArticleMaster[]
  isSyncing: boolean

  // Actions
  addCompany: (company: Omit<CompanyMaster, 'id' | 'assetsCount' | 'usersCount'> & { id?: string }) => Promise<CompanyMaster>
  updateCompany: (id: string, updates: Partial<CompanyMaster>) => void
  deleteCompany: (id: string) => void

  addUser: (user: Omit<UserMaster, 'id'> & { id?: string }) => Promise<UserMaster>
  updateUser: (id: string, updates: Partial<UserMaster>) => void
  resetUserPassword: (id: string, newPassword?: string) => Promise<string>
  deleteUser: (id: string) => void

  addAsset: (asset: Omit<AssetMaster, 'id'> & { id?: string }) => Promise<AssetMaster>
  updateAsset: (id: string, updates: Partial<AssetMaster>) => void
  deleteAsset: (id: string) => void

  addAMCContract: (contract: Omit<AMCContractMaster, 'id' | 'contractNumber'> & { id?: string; contractNumber?: string }) => Promise<AMCContractMaster>
  updateAMCContract: (id: string, updates: Partial<AMCContractMaster>) => void

  addTicket: (ticket: Omit<TicketMaster, 'id'> & { id?: string }) => Promise<TicketMaster>
  updateTicket: (id: string, updates: Partial<TicketMaster>) => void
  setTickets: (tickets: TicketMaster[]) => void

  addInventoryPart: (part: Omit<InventoryPartMaster, 'id'> & { id?: string }) => Promise<InventoryPartMaster>
  updateInventoryPart: (id: string, updates: Partial<InventoryPartMaster>) => void
  reserveInventoryStock: (id: string, quantity?: number) => Promise<number>
  deleteInventoryPart: (id: string) => void

  addKBArticle: (article: Omit<KBArticleMaster, 'id' | 'views' | 'helpful' | 'lastUpdated'> & { id?: string }) => Promise<KBArticleMaster>

  purgeMockData: () => void
  syncFromSupabase: () => Promise<void>
}

// Clear any stale mock data if present
const cleanMockFilter = <T extends { company?: string; mappedCompany?: string; title?: string; name?: string }>(items: T[]): T[] => {
  return (items || []).filter(item => {
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
      assets: [] as AssetMaster[],
      amcContracts: [] as AMCContractMaster[],
      tickets: [] as TicketMaster[],
      inventoryParts: [] as InventoryPartMaster[],
      kbArticles: [] as KBArticleMaster[],
      isSyncing: false,

      purgeMockData: () => {
        set((state) => ({
          companies: cleanMockFilter(state.companies),
          users: cleanMockFilter(state.users),
          assets: cleanMockFilter(state.assets),
          amcContracts: cleanMockFilter(state.amcContracts),
          inventoryParts: cleanMockFilter(state.inventoryParts || []),
          kbArticles: cleanMockFilter(state.kbArticles || []),
          tickets: (state.tickets || []).filter(t => !['Acme Corp', 'Globex Ltd', 'Initech Inc'].includes(t.company)).map(t => {
            if (!t.assignee || t.assignee.name === 'Support Staff' || t.assignee.avatar?.includes('pravatar')) {
              return { ...t, assignee: { name: 'Unassigned', avatar: '' } }
            }
            return t
          })
        }))
      },

      addCompany: async (compData) => {
        const newCompany: CompanyMaster = {
          id: compData.id || '',
          name: compData.name,
          code: compData.code || compData.name.slice(0, 4).toUpperCase(),
          industry: compData.industry || 'Industrial Manufacturing',
          email: compData.email || `admin@${compData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
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
        }).select('*').single()
        if (error || !data) throw new Error(error?.message || 'Could not save company.')
        newCompany.id = data.id
        newCompany.created_at = data.created_at
        set((state) => ({ companies: [newCompany, ...state.companies] }))

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

      deleteCompany: (id) => {
        set((state) => ({
          companies: state.companies.filter(c => c.id !== id)
        }))

        ;(supabase.from as any)('companies').delete().eq('id', id).then(({ error }: any) => {
          if (error) console.warn('Supabase company delete warning:', error.message)
        })
      },

      addUser: async (userData) => {
        const generatedPassword = userData.password || userData.defaultPassword || `KaaPass2026!#`
        const normalizedEmail = userData.email.trim().toLowerCase()
        const { error: createError } = await (supabase.rpc as any)('admin_create_user', {
          p_email: normalizedEmail,
          p_password: generatedPassword,
          p_full_name: userData.name.trim(),
          p_role_type: userData.roleType,
          p_role_name: userData.roleName || (userData.roleType === 'KAA Internal Staff' ? 'Field Engineer' : 'Client Requester'),
          p_mapped_company: userData.roleType === 'KAA Internal Staff' ? 'Global (All Companies)' : userData.mappedCompany
        })

        if (createError) throw new Error(createError.message)

        // The create RPC may return an ID, while older versions return void.
        // Resolve void responses from the same directory used by the page on refresh.
        const { data: directoryData, error: directoryError } = await (supabase.rpc as any)('get_users_directory')
        if (directoryError) {
          throw new Error(`User creation was accepted, but the directory could not confirm it: ${directoryError.message}`)
        }
        const directoryRecord = (Array.isArray(directoryData) ? directoryData : []).find(
          (record: any) => String(record.email || '').trim().toLowerCase() === normalizedEmail
        )
        if (!directoryRecord?.id) {
          throw new Error('Supabase accepted the create request, but the new user is missing from its directory. Check the admin_create_user and get_users_directory functions before retrying.')
        }

        const newUser: UserMaster = {
          id: directoryRecord.id,
          name: userData.name,
          email: normalizedEmail,
          roleType: userData.roleType,
          roleName: userData.roleName || (userData.roleType === 'KAA Internal Staff' ? 'Field Engineer' : 'Client Requester'),
          mappedCompany: userData.roleType === 'KAA Internal Staff' ? 'Global (All Companies)' : userData.mappedCompany,
          status: userData.status || 'Active',
          passwordHash: userData.passwordHash,
          isPasswordResetRequired: true,
          created_at: directoryRecord?.created_at || new Date().toISOString()
        }

        set((state) => {
          const updatedCompanies = state.companies.map(c => 
            c.name === newUser.mappedCompany ? { ...c, usersCount: c.usersCount + 1 } : c
          )
          return {
            users: [newUser, ...state.users],
            companies: updatedCompanies
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

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter(u => u.id !== id)
        }))

        ;(supabase.from as any)('profiles').update({ is_active: false }).eq('id', id).then(({ error }: any) => {
          if (error) console.warn('Supabase user deactivation warning:', error.message)
        })
      },

      addAsset: async (assetData) => {
        const newAsset: AssetMaster = {
          id: assetData.id || '',
          tag: assetData.tag || `AST-2026-${Math.floor(100 + Math.random() * 900)}`,
          name: assetData.name,
          company: assetData.company,
          category: assetData.category || 'Machinery',
          model: assetData.model || 'Standard Unit',
          serial: assetData.serial || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
          status: assetData.status || 'Active',
          amcStatus: assetData.amcStatus || 'Active AMC',
          warrantyExpires: assetData.warrantyExpires || '2027-12-31',
          assetUser: assetData.assetUser || '',
          hardwareType: assetData.hardwareType || 'Laptops',
          description: assetData.description || '',
          remarks: assetData.remarks || '',
          suggestion: assetData.suggestion || '',
          provisionPath: assetData.provisionPath || '',
          created_at: new Date().toISOString()
        }

        const { data: company, error: companyError } = await (supabase.from as any)('companies')
          .select('id').eq('name', newAsset.company).single()
        if (companyError || !company?.id) {
          throw new Error(companyError?.message || `Company "${newAsset.company}" was not found.`)
        }

        const { data: insertedAsset, error: insertError } = await (supabase.from as any)('assets').insert({
          company_id: company.id,
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
          throw new Error(insertError?.message || 'Could not save asset.')
        }

        newAsset.id = insertedAsset.id
        newAsset.created_at = insertedAsset.created_at || newAsset.created_at
        set((state) => ({
          assets: [newAsset, ...state.assets],
          companies: state.companies.map(c => c.id === company.id ? { ...c, assetsCount: c.assetsCount + 1 } : c)
        }))

        return newAsset
      },

      updateAsset: (id, updates) => {
        set((state) => ({
          assets: state.assets.map(a => a.id === id ? { ...a, ...updates } : a)
        }))

        ;(supabase.from as any)('assets').update(updates).eq('id', id).then(({ error }: any) => {
          if (error) console.warn('Supabase asset update warning:', error.message)
        })
      },

      deleteAsset: (id) => {
        set((state) => ({
          assets: state.assets.filter(a => a.id !== id)
        }))

        ;(supabase.from as any)('assets').delete().eq('id', id).then(({ error }: any) => {
          if (error) console.warn('Supabase asset delete warning:', error.message)
        })
      },

      addAMCContract: async (contractData) => {
        const nextNum = get().amcContracts.length + 1
        const numStr = `AMC-2026-${nextNum < 10 ? '00' : '0'}${nextNum}`
        const newContract: AMCContractMaster = {
          id: contractData.id || numStr,
          contractNumber: contractData.contractNumber || numStr,
          name: contractData.name,
          company: contractData.company,
          startDate: contractData.startDate || new Date().toISOString().split('T')[0],
          endDate: contractData.endDate || '2026-12-31',
          totalVisits: Number(contractData.totalVisits) || 12,
          usedVisits: Number(contractData.usedVisits) || 0,
          status: contractData.status || 'Active',
          includedLabor: contractData.includedLabor ?? true,
          created_at: new Date().toISOString()
        }

        const { data: company, error: companyError } = await (supabase.from as any)('companies')
          .select('id').eq('name', newContract.company).maybeSingle()
        if (companyError) throw new Error(companyError.message)
        const { data, error } = await (supabase.from as any)('amc_contracts').insert({
          company_id: company?.id || null,
          contract_number: newContract.contractNumber,
          name: newContract.name,
          status: newContract.status.toLowerCase(),
          start_date: newContract.startDate,
          end_date: newContract.endDate,
          total_visits: newContract.totalVisits,
          used_visits: newContract.usedVisits,
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
          priority: newTicket.priority,
          status: newTicket.status,
          category: newTicket.category,
          created_at: newTicket.createdAt
        }).select('id, ticket_number, created_at').single()
        if (error || !data) throw new Error(error?.message || 'Could not save ticket.')
        newTicket.id = data.ticket_number || data.id
        newTicket.ticket_number = data.ticket_number || newTicket.id
        newTicket.createdAt = data.created_at || newTicket.createdAt
        set((state) => ({ tickets: [newTicket, ...state.tickets] }))

        return newTicket
      },

      updateTicket: (id, updates) => {
        set((state) => ({
          tickets: state.tickets.map(t => (t.id === id || t.ticket_number === id) ? { ...t, ...updates } : t)
        }))

        ;(supabase.from as any)('tickets').update(updates).or(`ticket_number.eq.${id},id.eq.${id}`).then(({ error }: any) => {
          if (error) console.warn('Supabase ticket update warning:', error.message)
        })
      },

      setTickets: (tickets) => set({ tickets }),

      addInventoryPart: async (partData) => {
        const nextId = (get().inventoryParts || []).length + 1
        const newPart: InventoryPartMaster = {
          id: partData.id || `PRT-${nextId}`,
          sku: partData.sku || `PRT-${Math.floor(1000 + Math.random() * 9000)}`,
          name: partData.name,
          category: partData.category || 'Hardware',
          location: partData.location || 'Central Warehouse, Zone A',
          unitPrice: partData.unitPrice || '₹12,500',
          stock: Number(partData.stock) || 10,
          minStock: Number(partData.minStock) || 2,
          created_at: new Date().toISOString()
        }

        const { data: categoryData, error: categoryError } = await (supabase.from as any)('part_categories')
          .select('id').eq('name', newPart.category).limit(1).maybeSingle()
        if (categoryError) throw new Error(categoryError.message)
        let categoryId = categoryData?.id
        if (!categoryId) {
          const { data: createdCategory, error: createCategoryError } = await (supabase.from as any)('part_categories')
            .insert({ name: newPart.category }).select('id').single()
          if (createCategoryError || !createdCategory) throw new Error(createCategoryError?.message || 'Could not save part category.')
          categoryId = createdCategory.id
        }

        const { data: warehouseData, error: warehouseError } = await (supabase.from as any)('warehouses')
          .select('id').eq('name', newPart.location).limit(1).maybeSingle()
        if (warehouseError) throw new Error(warehouseError.message)
        let warehouseId = warehouseData?.id
        if (!warehouseId) {
          const { data: createdWarehouse, error: createWarehouseError } = await (supabase.from as any)('warehouses')
            .insert({ name: newPart.location, is_active: true }).select('id').single()
          if (createWarehouseError || !createdWarehouse) throw new Error(createWarehouseError?.message || 'Could not save warehouse.')
          warehouseId = createdWarehouse.id
        }

        const { data, error } = await (supabase.from as any)('parts').insert({
          name: newPart.name,
          sku: newPart.sku,
          category_id: categoryId,
          unit_price: parseFloat(newPart.unitPrice.replace(/[^0-9.]/g, '')) || 0,
          min_stock_level: newPart.minStock,
          is_active: true
        }).select('id, sku, created_at').single()
        if (error || !data) throw new Error(error?.message || 'Could not save spare part.')

        const { error: stockError } = await (supabase.from as any)('stock_levels').insert({
          part_id: data.id,
          warehouse_id: warehouseId,
          quantity: newPart.stock
        })
        if (stockError) {
          await (supabase.from as any)('parts').delete().eq('id', data.id)
          throw new Error(`Part was not added because its opening stock could not be saved: ${stockError.message}`)
        }

        newPart.id = data.id
        newPart.sku = data.sku
        newPart.created_at = data.created_at
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
        if (!part) throw new Error('Spare part was not found.')
        const { data: warehouse, error: warehouseError } = await (supabase.from as any)('warehouses')
          .select('id').eq('name', part.location).limit(1).maybeSingle()
        if (warehouseError || !warehouse) throw new Error(warehouseError?.message || 'Warehouse was not found.')
        const { data: stockLevel, error: stockError } = await (supabase.from as any)('stock_levels')
          .select('id, quantity, reserved_quantity').eq('part_id', id).eq('warehouse_id', warehouse.id).single()
        if (stockError || !stockLevel) throw new Error(stockError?.message || 'Stock level was not found.')
        const availableStock = stockLevel.quantity - (stockLevel.reserved_quantity || 0)
        if (availableStock < quantity) throw new Error('Not enough stock is available to reserve.')
        const newReservedQuantity = (stockLevel.reserved_quantity || 0) + quantity
        const remainingStock = stockLevel.quantity - newReservedQuantity
        const { error: updateError } = await (supabase.from as any)('stock_levels')
          .update({ reserved_quantity: newReservedQuantity }).eq('id', stockLevel.id)
        if (updateError) throw new Error(updateError.message)
        set((state) => ({
          inventoryParts: (state.inventoryParts || []).map(item => item.id === id ? { ...item, stock: remainingStock } : item)
        }))
        return remainingStock
      },

      deleteInventoryPart: (id) => {
        set((state) => ({
          inventoryParts: (state.inventoryParts || []).filter(p => p.id !== id)
        }))

        ;(supabase.from as any)('parts').delete().eq('id', id).then(({ error }: any) => {
          if (error) console.warn('Supabase parts delete warning:', error.message)
        })
      },

      addKBArticle: async (articleData) => {
        const nextId = (get().kbArticles || []).length + 1
        const newArticle: KBArticleMaster = {
          id: articleData.id || `${nextId}`,
          title: articleData.title,
          category: articleData.category || 'Hardware',
          content: articleData.content || 'Troubleshooting and step-by-step resolution procedure for this component.',
          views: 1,
          helpful: 100,
          lastUpdated: 'Just now',
          created_at: new Date().toISOString()
        }

        const { data, error } = await (supabase.from as any)('kb_articles').insert({
          title: newArticle.title,
          slug: newArticle.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          content: newArticle.content,
          status: 'published'
        }).select('id, created_at').single()
        if (error || !data) throw new Error(error?.message || 'Could not save knowledge article.')
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
              company: t.contact_name || 'KAA Client',
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

          // 3. Sync Live Users Directory (via security-definer database function)
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

          // 4. Sync Live Assets
          const { data: dbAssets } = await (supabase.from as any)('assets').select('*')
          if (Array.isArray(dbAssets)) {
            const mappedAssets: AssetMaster[] = dbAssets.map((a: any) => ({
              id: a.id,
              tag: a.asset_tag || `AST-${a.id.slice(0, 6)}`,
              name: a.name,
              company: get().companies.find((company: CompanyMaster) => company.id === a.company_id)?.name || 'KAA Client',
              category: 'Machinery',
              model: a.model || 'Standard Unit',
              serial: a.serial_number || 'N/A',
              status: a.status || 'Active',
              amcStatus: 'Active AMC',
              warrantyExpires: '2027-12-31',
              assetUser: a.asset_user || '',
              hardwareType: a.hardware_type || 'Laptops',
              description: a.description || '',
              remarks: a.remarks || '',
              suggestion: a.suggestion || '',
              provisionPath: a.provision_path || '',
              created_at: a.created_at
            }))
            set({ assets: mappedAssets })
          }

          // 5. Sync Live AMC Contracts
          const { data: dbContracts } = await (supabase.from as any)('amc_contracts').select('*')
          if (Array.isArray(dbContracts)) {
            const mappedContracts: AMCContractMaster[] = dbContracts.map((c: any) => ({
              id: c.id,
              contractNumber: c.contract_number || `AMC-${c.id.slice(0, 6)}`,
              name: c.name,
              company: get().companies.find((company: CompanyMaster) => company.id === c.company_id)?.name || 'KAA Client',
              startDate: c.start_date || '2026-01-01',
              endDate: c.end_date || '2026-12-31',
              totalVisits: c.total_visits || 12,
              usedVisits: c.used_visits || 0,
              status: c.status || 'Active',
              includedLabor: c.included_labor ?? true,
              created_at: c.created_at
            }))
            set({ amcContracts: mappedContracts })
          }

          // 6. Sync Live Spare Parts
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

          // 7. Sync Live KB Articles
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
        assets: state.assets,
        amcContracts: state.amcContracts,
        tickets: state.tickets,
        inventoryParts: state.inventoryParts,
        kbArticles: state.kbArticles,
      }),
    }
  )
)
