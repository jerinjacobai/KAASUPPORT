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

const seedCompanies: CompanyMaster[] = [
  {
    id: 'COMP-1',
    name: 'Acme Corp',
    code: 'ACME',
    industry: 'Industrial Manufacturing',
    email: 'admin@acme.com',
    phone: '+91 98765 43210',
    assetsCount: 3,
    usersCount: 5,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'COMP-2',
    name: 'Globex Ltd',
    code: 'GLBX',
    industry: 'Electronics & Automation',
    email: 'support@globex.com',
    phone: '+91 98111 22233',
    assetsCount: 2,
    usersCount: 3,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'COMP-3',
    name: 'Initech Inc',
    code: 'INTC',
    industry: 'Pharma & Healthcare',
    email: 'contact@initech.com',
    phone: '+91 98444 55566',
    assetsCount: 2,
    usersCount: 2,
    is_active: true,
    created_at: new Date().toISOString()
  }
]

const seedUsers: UserMaster[] = [
  {
    id: 'USR-1',
    name: 'Alex Johnson',
    email: 'alex.johnson@kaasupport.com',
    roleType: 'KAA Internal Staff',
    roleName: 'Senior Field Engineer',
    mappedCompany: 'Global (All Companies)',
    status: 'Active',
    password: 'KaaPass2026!#',
    defaultPassword: 'KaaPass2026!#',
    isPasswordResetRequired: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'USR-2',
    name: 'Priya Sharma',
    email: 'priya.sharma@kaasupport.com',
    roleType: 'KAA Internal Staff',
    roleName: 'Service Coordinator',
    mappedCompany: 'Global (All Companies)',
    status: 'Active',
    password: 'KaaPass2026!#',
    defaultPassword: 'KaaPass2026!#',
    isPasswordResetRequired: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'USR-3',
    name: 'Robert Vance',
    email: 'robert@acme.com',
    roleType: 'Client User',
    roleName: 'Company Admin',
    mappedCompany: 'Acme Corp',
    status: 'Active',
    password: 'AcmePass2026!',
    defaultPassword: 'AcmePass2026!',
    isPasswordResetRequired: false,
    created_at: new Date().toISOString()
  }
]

const seedAssets: AssetMaster[] = [
  {
    id: 'AST-1',
    tag: 'AST-2026-901',
    name: 'Siemens S7-1500 Controller Rack',
    company: 'Acme Corp',
    category: 'Machinery',
    model: 'CPU 1518-4 PN/DP',
    serial: 'SN-99481A',
    status: 'Active',
    amcStatus: 'Active AMC',
    warrantyExpires: '2027-12-31'
  },
  {
    id: 'AST-2',
    tag: 'AST-2026-902',
    name: 'ABB Industrial Robotic Arm IRB 6700',
    company: 'Acme Corp',
    category: 'Robotics',
    model: 'IRB 6700-235/2.65',
    serial: 'SN-88120B',
    status: 'Active',
    amcStatus: 'Active AMC',
    warrantyExpires: '2026-11-30'
  },
  {
    id: 'AST-3',
    tag: 'AST-2026-903',
    name: 'Schneider Electric Variable Frequency Drive',
    company: 'Globex Ltd',
    category: 'Electrical',
    model: 'Altivar Process ATV930',
    serial: 'SN-77301C',
    status: 'Active',
    amcStatus: 'No AMC Coverage',
    warrantyExpires: '2025-08-15'
  }
]

const seedAMCContracts: AMCContractMaster[] = [
  {
    id: 'AMC-2026-001',
    contractNumber: 'AMC-2026-001',
    name: 'Annual Comprehensive Automation Support',
    company: 'Acme Corp',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    totalVisits: 12,
    usedVisits: 4,
    status: 'Active',
    includedLabor: true
  },
  {
    id: 'AMC-2026-002',
    contractNumber: 'AMC-2026-002',
    name: 'Preventative Robotics Maintenance Plan',
    company: 'Globex Ltd',
    startDate: '2026-03-01',
    endDate: '2027-02-28',
    totalVisits: 8,
    usedVisits: 2,
    status: 'Active',
    includedLabor: true
  }
]

const seedTickets: TicketMaster[] = [
  {
    id: 'TKT-1064',
    ticket_number: 'TKT-1064',
    title: 'Siemens PLC input module failure on line 3',
    description: 'Input module LED blinking red. Machinery halted on main assembly line.',
    company: 'Acme Corp',
    assetId: 'AST-1',
    priority: 'critical',
    status: 'in_progress',
    category: 'Hardware',
    assignee: { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=1' },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    slaBreached: false
  },
  {
    id: 'TKT-1063',
    ticket_number: 'TKT-1063',
    title: 'VFD overcurrent alarm trip during startup',
    description: 'Drive trips immediately upon motor excitation. Suspected parameter drift.',
    company: 'Globex Ltd',
    assetId: 'AST-3',
    priority: 'high',
    status: 'open',
    category: 'Electrical',
    assignee: { name: 'Priya Sharma', avatar: 'https://i.pravatar.cc/150?u=2' },
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    slaBreached: false
  },
  {
    id: 'TKT-1062',
    ticket_number: 'TKT-1062',
    title: 'Robotic arm calibration error after power restore',
    description: 'Axis 3 offset mismatch by +1.4mm. Requires zero-point calibration.',
    company: 'Acme Corp',
    assetId: 'AST-2',
    priority: 'medium',
    status: 'resolved',
    category: 'Robotics',
    assignee: { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=1' },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    slaBreached: false
  }
]

interface MasterState {
  companies: CompanyMaster[]
  users: UserMaster[]
  assets: AssetMaster[]
  amcContracts: AMCContractMaster[]
  tickets: TicketMaster[]

  // Actions
  addCompany: (company: Omit<CompanyMaster, 'id' | 'assetsCount' | 'usersCount'> & { id?: string }) => CompanyMaster
  updateCompany: (id: string, updates: Partial<CompanyMaster>) => void
  deleteCompany: (id: string) => void

  addUser: (user: Omit<UserMaster, 'id'> & { id?: string }) => UserMaster
  updateUser: (id: string, updates: Partial<UserMaster>) => void
  resetUserPassword: (id: string, newPassword?: string) => string
  deleteUser: (id: string) => void

  addAsset: (asset: Omit<AssetMaster, 'id'> & { id?: string }) => AssetMaster
  updateAsset: (id: string, updates: Partial<AssetMaster>) => void
  deleteAsset: (id: string) => void

  addAMCContract: (contract: Omit<AMCContractMaster, 'id' | 'contractNumber'> & { id?: string; contractNumber?: string }) => AMCContractMaster
  updateAMCContract: (id: string, updates: Partial<AMCContractMaster>) => void

  addTicket: (ticket: Omit<TicketMaster, 'id'> & { id?: string }) => TicketMaster
  updateTicket: (id: string, updates: Partial<TicketMaster>) => void
  setTickets: (tickets: TicketMaster[]) => void

  syncFromSupabase: () => Promise<void>
}

export const useMasterStore = create<MasterState>()(
  persist(
    (set, get) => ({
      companies: seedCompanies,
      users: seedUsers,
      assets: seedAssets,
      amcContracts: seedAMCContracts,
      tickets: seedTickets,

      addCompany: (compData) => {
        const newId = compData.id || `COMP-${get().companies.length + 1}`
        const newCompany: CompanyMaster = {
          id: newId,
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

        set((state) => ({ companies: [newCompany, ...state.companies] }))

        // Async insert to Supabase if reachable
        supabase.from('companies').insert([{
          name: newCompany.name,
          code: newCompany.code,
          industry: newCompany.industry,
          email: newCompany.email,
          phone: newCompany.phone,
          is_active: newCompany.is_active
        }] as any).then(({ error }) => {
          if (error) console.warn('Supabase company insert warning:', error.message)
        })

        return newCompany
      },

      updateCompany: (id, updates) => {
        set((state) => ({
          companies: state.companies.map(c => c.id === id ? { ...c, ...updates } : c)
        }))
      },

      deleteCompany: (id) => {
        set((state) => ({
          companies: state.companies.filter(c => c.id !== id)
        }))
      },

      addUser: (userData) => {
        const newId = userData.id || `USR-${get().users.length + 1}`
        const generatedPassword = userData.password || `KaaPass2026!#`
        const newUser: UserMaster = {
          id: newId,
          name: userData.name,
          email: userData.email,
          roleType: userData.roleType,
          roleName: userData.roleName || (userData.roleType === 'KAA Internal Staff' ? 'Field Engineer' : 'Client Requester'),
          mappedCompany: userData.roleType === 'KAA Internal Staff' ? 'Global (All Companies)' : userData.mappedCompany,
          status: userData.status || 'Active',
          password: generatedPassword,
          defaultPassword: generatedPassword,
          isPasswordResetRequired: true,
          created_at: new Date().toISOString()
        }

        set((state) => {
          // Increment company user count if mapped
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
      },

      resetUserPassword: (id, newPassword) => {
        const passwordToSet = newPassword || `KaaReset${Math.floor(1000 + Math.random() * 9000)}!`
        set((state) => ({
          users: state.users.map(u => u.id === id ? { 
            ...u, 
            password: passwordToSet,
            isPasswordResetRequired: true 
          } : u)
        }))
        return passwordToSet
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter(u => u.id !== id)
        }))
      },

      addAsset: (assetData) => {
        const newId = assetData.id || `AST-${get().assets.length + 1}`
        const newAsset: AssetMaster = {
          id: newId,
          tag: assetData.tag || `AST-2026-${Math.floor(100 + Math.random() * 900)}`,
          name: assetData.name,
          company: assetData.company,
          category: assetData.category || 'Machinery',
          model: assetData.model || 'Standard Unit',
          serial: assetData.serial || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
          status: assetData.status || 'Active',
          amcStatus: assetData.amcStatus || 'Active AMC',
          warrantyExpires: assetData.warrantyExpires || '2027-12-31',
          created_at: new Date().toISOString()
        }

        set((state) => {
          const updatedCompanies = state.companies.map(c => 
            c.name === newAsset.company ? { ...c, assetsCount: c.assetsCount + 1 } : c
          )
          return {
            assets: [newAsset, ...state.assets],
            companies: updatedCompanies
          }
        })

        supabase.from('assets').insert([{
          asset_tag: newAsset.tag,
          name: newAsset.name,
          model: newAsset.model,
          serial_number: newAsset.serial,
          status: newAsset.status
        }] as any).then(({ error }) => {
          if (error) console.warn('Supabase asset insert warning:', error.message)
        })

        return newAsset
      },

      updateAsset: (id, updates) => {
        set((state) => ({
          assets: state.assets.map(a => a.id === id ? { ...a, ...updates } : a)
        }))
      },

      deleteAsset: (id) => {
        set((state) => ({
          assets: state.assets.filter(a => a.id !== id)
        }))
      },

      addAMCContract: (contractData) => {
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

        set((state) => ({
          amcContracts: [newContract, ...state.amcContracts]
        }))

        supabase.from('amc_contracts').insert([{
          contract_number: newContract.contractNumber,
          title: newContract.name,
          status: newContract.status,
          start_date: newContract.startDate,
          end_date: newContract.endDate,
          visit_quota_annual: newContract.totalVisits
        }] as any).then(({ error }) => {
          if (error) console.warn('Supabase amc_contracts insert warning:', error.message)
        })

        return newContract
      },

      updateAMCContract: (id, updates) => {
        set((state) => ({
          amcContracts: state.amcContracts.map(c => c.id === id ? { ...c, ...updates } : c)
        }))
      },

      addTicket: (ticketData) => {
        const nextIdNum = 1065 + get().tickets.length
        const ticketId = ticketData.id || `TKT-${nextIdNum}`
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
          assignee: ticketData.assignee || { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=1' },
          createdAt: new Date().toISOString(),
          slaBreached: false
        }

        set((state) => ({
          tickets: [newTicket, ...state.tickets]
        }))

        supabase.from('tickets').insert([{
          ticket_number: newTicket.ticket_number,
          title: newTicket.title,
          description: newTicket.description,
          source: 'portal',
          contact_name: newTicket.company,
          created_at: newTicket.createdAt
        }] as any).then(({ error }) => {
          if (error) console.warn('Supabase ticket insert warning:', error.message)
        })

        return newTicket
      },

      updateTicket: (id, updates) => {
        set((state) => ({
          tickets: state.tickets.map(t => t.id === id ? { ...t, ...updates } : t)
        }))
      },

      setTickets: (tickets) => set({ tickets }),

      syncFromSupabase: async () => {
        try {
          const { data: dbTickets } = await supabase.from('tickets').select('*')
          if (dbTickets && dbTickets.length > 0) {
            const mappedDbTickets: TicketMaster[] = dbTickets.map((t: any) => ({
              id: t.ticket_number || t.id,
              ticket_number: t.ticket_number || t.id,
              title: t.title || 'Support Request',
              description: t.description || '',
              company: t.contact_name || 'KAA Client',
              priority: t.priority || 'medium',
              status: t.status || 'open',
              category: t.category || 'General',
              assignee: { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=1' },
              createdAt: t.created_at || new Date().toISOString()
            }))
            // Merge unique tickets
            const existingIds = new Set(get().tickets.map(t => t.id))
            const newToAdd = mappedDbTickets.filter(t => !existingIds.has(t.id))
            if (newToAdd.length > 0) {
              set(state => ({ tickets: [...newToAdd, ...state.tickets] }))
            }
          }
        } catch {
          // preserve local store
        }
      }
    }),
    {
      name: 'kaa-master-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
