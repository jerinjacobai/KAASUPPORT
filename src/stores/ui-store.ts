import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  theme: 'dark' | 'light' | 'system'
  commandPaletteOpen: boolean
  notificationPanelOpen: boolean
  activeView: 'list' | 'kanban' | 'calendar' | 'timeline'
  ticketDetailPanelOpen: boolean
  selectedTicketId: string | null
  
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: 'dark' | 'light' | 'system') => void
  setCommandPaletteOpen: (open: boolean) => void
  setNotificationPanelOpen: (open: boolean) => void
  setActiveView: (view: 'list' | 'kanban' | 'calendar' | 'timeline') => void
  setTicketDetailPanelOpen: (open: boolean) => void
  setSelectedTicketId: (id: string | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'dark',
  commandPaletteOpen: false,
  notificationPanelOpen: false,
  activeView: 'list',
  ticketDetailPanelOpen: false,
  selectedTicketId: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setTheme: (theme) => {
    set({ theme })
    // Apply theme logic
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
      return
    }
    root.classList.add(theme)
  },
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),
  setActiveView: (view) => set({ activeView: view }),
  setTicketDetailPanelOpen: (open) => set({ ticketDetailPanelOpen: open }),
  setSelectedTicketId: (id) => set({ selectedTicketId: id, ticketDetailPanelOpen: !!id }),
}))

export const useUIStore = useUiStore

