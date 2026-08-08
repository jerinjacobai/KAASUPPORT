export const mockStats = {
  totalTickets: { value: 1248, change: 12.5, trend: 'up' },
  openTickets: { value: 142, change: -5.2, trend: 'down', breakdown: { critical: 12, high: 28, medium: 54, low: 48 } },
  avgResponseTime: { value: '1.2 hrs', change: -15.4, trend: 'down' }, // Down is good here
  slaCompliance: { value: 94.2, change: 2.1, trend: 'up' }
};

export const mockChartData = {
  ticketVolume: Array.from({ length: 30 }).map((_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tickets: Math.floor(Math.random() * 50) + 20,
    resolved: Math.floor(Math.random() * 45) + 15,
  })),
  ticketsByPriority: [
    { name: 'Critical', value: 12, color: '#ef4444' },
    { name: 'High', value: 28, color: '#f97316' },
    { name: 'Medium', value: 54, color: '#eab308' },
    { name: 'Low', value: 48, color: '#3b82f6' },
  ],
  engineerPerformance: [
    { name: 'Alex Johnson', resolved: 45, csat: 4.8 },
    { name: 'Sarah Smith', resolved: 52, csat: 4.9 },
    { name: 'Mike Chen', resolved: 38, csat: 4.5 },
    { name: 'Lisa Taylor', resolved: 61, csat: 4.7 },
    { name: 'David Wilson', resolved: 42, csat: 4.6 },
  ],
  slaPerformance: Array.from({ length: 12 }).map((_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    responseSla: Math.floor(Math.random() * 10) + 90,
    resolutionSla: Math.floor(Math.random() * 15) + 85,
  }))
};

export const mockTickets = Array.from({ length: 20 }).map((_, i) => {
  const priorities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed'];
  
  return {
    id: `TKT-${1000 + i}`,
    title: `Issue with system component ${i + 1}`,
    description: `User is experiencing issues with the main application component resulting in degraded performance.`,
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    assignee: { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=' + i },
    company: i % 3 === 0 ? 'Acme Corp' : (i % 3 === 1 ? 'Globex Ltd' : 'Initech Inc'),
    createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
    slaBreached: Math.random() > 0.8
  };
});

export const mockNotifications = [
  { id: 1, type: 'ticket_update', title: 'Ticket TKT-1042 Updated', description: 'Sarah commented on your ticket.', read: false, time: '5m ago' },
  { id: 2, type: 'sla_warning', title: 'SLA Warning', description: 'Ticket TKT-1038 is about to breach SLA.', read: false, time: '12m ago' },
  { id: 3, type: 'assignment', title: 'New Assignment', description: 'You have been assigned to TKT-1055.', read: true, time: '1h ago' },
  { id: 4, type: 'system', title: 'System Maintenance', description: 'Scheduled maintenance this weekend.', read: true, time: '2d ago' },
];

export const mockTimeline = [
  { id: 1, type: 'status_change', content: 'Status changed from Open to In Progress', user: { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=1' }, timestamp: '2 hours ago' },
  { id: 2, type: 'comment', content: 'I have started looking into this issue. It seems related to the recent database migration. Will keep you posted.', user: { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=1' }, timestamp: '2 hours ago' },
  { id: 3, type: 'assignment', content: 'Assigned to Alex Johnson', user: { name: 'System', avatar: '' }, timestamp: '3 hours ago' },
  { id: 4, type: 'creation', content: 'Ticket created by user via Support Portal', user: { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=5' }, timestamp: '3 hours ago' },
];

export const mockEngineers = [
  { id: 'eng-1', name: 'Alex Johnson', role: 'Senior Field Engineer', avatar: 'https://i.pravatar.cc/150?u=1', status: 'Available', activeVisits: 2, completedVisits: 148, rating: 4.9, location: 'Bangalore, KA', skills: ['Electrical', 'PLC', 'ERP Hardware'] },
  { id: 'eng-2', name: 'Sarah Smith', role: 'Hardware Specialist', avatar: 'https://i.pravatar.cc/150?u=2', status: 'On Site', activeVisits: 1, completedVisits: 182, rating: 4.95, location: 'Mumbai, MH', skills: ['Networking', 'Server Hardware', 'Biometrics'] },
  { id: 'eng-3', name: 'Mike Chen', role: 'Database & Cloud Engineer', avatar: 'https://i.pravatar.cc/150?u=3', status: 'En Route', activeVisits: 3, completedVisits: 112, rating: 4.7, location: 'Delhi, DL', skills: ['PostgreSQL', 'Cloud Infrastructure', 'API'] },
  { id: 'eng-4', name: 'Lisa Taylor', role: 'PLC & Automation Engineer', avatar: 'https://i.pravatar.cc/150?u=4', status: 'Offline', activeVisits: 0, completedVisits: 210, rating: 4.85, location: 'Chennai, TN', skills: ['PLC Siemens', 'SCADA', 'Mechanical'] },
];

export const mockFieldVisits = [
  { id: 'visit-101', ticketId: 'TKT-1004', engineerName: 'Sarah Smith', engineerAvatar: 'https://i.pravatar.cc/150?u=2', companyName: 'Acme Corp', location: 'Tech Park, Bldg 4, Bangalore', scheduledStart: '10:00 AM', status: 'Arrived On Site', checkInTime: '10:05 AM', GPSConfirmed: true },
  { id: 'visit-102', ticketId: 'TKT-1009', engineerName: 'Alex Johnson', engineerAvatar: 'https://i.pravatar.cc/150?u=1', companyName: 'Globex Ltd', location: 'Industrial Zone, Hub 2, Mumbai', scheduledStart: '01:30 PM', status: 'Engineer En Route', checkInTime: null, GPSConfirmed: false },
  { id: 'visit-103', ticketId: 'TKT-1015', engineerName: 'Mike Chen', engineerAvatar: 'https://i.pravatar.cc/150?u=3', companyName: 'Initech Inc', location: 'Cyber City, Phase 3, Gurgaon', scheduledStart: '04:00 PM', status: 'Scheduled', checkInTime: null, GPSConfirmed: false },
];

export const mockAssets = [
  { id: 'ast-101', tag: 'AST-KAA-2026-001', name: 'Industrial Server Rack X900', category: 'Hardware Server', company: 'Acme Corp', model: 'Dell PowerEdge R750', serial: 'SN-99882211', status: 'Active', warrantyExpires: '2027-12-31', amcStatus: 'Active AMC' },
  { id: 'ast-102', tag: 'AST-KAA-2026-002', name: 'Biometric Scanner Gate A', category: 'Attendance', company: 'Globex Ltd', model: 'ZKTeco ProID', serial: 'SN-44332211', status: 'Maintenance', warrantyExpires: '2026-09-15', amcStatus: 'Expired' },
  { id: 'ast-103', tag: 'AST-KAA-2026-003', name: 'Siemens PLC Controller S7-1500', category: 'PLC Controller', company: 'Initech Inc', model: 'Simatic S7-1500', serial: 'SN-77112233', status: 'Active', warrantyExpires: '2028-06-30', amcStatus: 'Active AMC' },
];

export const mockAMCContracts = [
  { id: 'amc-1', contractNumber: 'AMC-2026-0089', company: 'Acme Corp', startDate: '2026-01-01', endDate: '2026-12-31', totalVisits: 12, usedVisits: 4, remainingVisits: 8, status: 'Active', value: '₹4,50,000' },
  { id: 'amc-2', contractNumber: 'AMC-2026-0092', company: 'Globex Ltd', startDate: '2025-06-01', endDate: '2026-05-31', totalVisits: 24, usedVisits: 20, remainingVisits: 4, status: 'Near Expiry', value: '₹8,20,000' },
  { id: 'amc-3', contractNumber: 'AMC-2026-0104', company: 'Initech Inc', startDate: '2026-03-15', endDate: '2027-03-14', totalVisits: 6, usedVisits: 1, remainingVisits: 5, status: 'Active', value: '₹2,10,000' },
];

export const mockInventoryParts = [
  { id: 'part-1', sku: 'PRT-PLC-001', name: 'Siemens Input/Output Module 16-Ch', category: 'PLC Spare', stock: 24, minStock: 5, unitPrice: '₹14,500', location: 'Warehouse Central-1' },
  { id: 'part-2', sku: 'PRT-BIO-004', name: 'Optical Fingerprint Sensor Module', category: 'Biometric', stock: 3, minStock: 10, unitPrice: '₹6,200', location: 'Warehouse North' },
  { id: 'part-3', sku: 'PRT-PSU-009', name: 'Redundant Power Supply 750W', category: 'Server Hardware', stock: 12, minStock: 4, unitPrice: '₹18,900', location: 'Warehouse Central-1' },
];

export const mockKBArticles = [
  { id: 'kb-1', title: 'How to Reset Biometric Attendance Terminal IP Configuration', category: 'Hardware', views: 1240, helpful: 94, lastUpdated: '2026-07-20' },
  { id: 'kb-2', title: 'Troubleshooting KAA ERP Database Connection Timeout Issues', category: 'Database', views: 3410, helpful: 98, lastUpdated: '2026-08-01' },
  { id: 'kb-3', title: 'Siemens PLC Alarm Code Diagnostics & Field Resolution Guide', category: 'PLC', views: 890, helpful: 91, lastUpdated: '2026-06-12' },
];
