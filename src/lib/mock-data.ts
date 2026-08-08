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
    company: i % 3 === 0 ? 'Acme Corp' : (i % 3 === 1 ? 'Globex' : 'Initech'),
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
