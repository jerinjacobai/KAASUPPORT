export const mockStats = {
  totalTickets: { value: 0, change: 0, trend: 'neutral' },
  openTickets: { value: 0, change: 0, trend: 'neutral', breakdown: { critical: 0, high: 0, medium: 0, low: 0 } },
  avgResponseTime: { value: '0 hrs', change: 0, trend: 'neutral' },
  slaCompliance: { value: 100, change: 0, trend: 'up' }
};

export const mockChartData = {
  ticketVolume: Array.from({ length: 14 }).map((_, i) => ({
    date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tickets: 0,
    resolved: 0,
  })),
  ticketsByPriority: [
    { name: 'Critical', value: 0, color: '#ef4444' },
    { name: 'High', value: 0, color: '#f97316' },
    { name: 'Medium', value: 0, color: '#eab308' },
    { name: 'Low', value: 0, color: '#3b82f6' },
  ],
  engineerPerformance: [],
  slaPerformance: Array.from({ length: 6 }).map((_, i) => ({
    month: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    responseSla: 100,
    resolutionSla: 100,
  }))
};

export const mockTickets: any[] = [];
export const mockNotifications: any[] = [];
export const mockTimeline: any[] = [];
export const mockEngineers: any[] = [];
export const mockFieldVisits: any[] = [];
export const mockAssets: any[] = [];
export const mockAMCContracts: any[] = [];
export const mockInventoryParts: any[] = [];
export const mockKBArticles: any[] = [];
