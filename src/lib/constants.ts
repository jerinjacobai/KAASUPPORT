export const APP_NAME = 'KAA Support'
export const APP_VERSION = '1.0.0'

export const TICKET_SOURCES = [
  { value: 'email', label: 'Email', icon: 'mail' },
  { value: 'portal', label: 'Portal', icon: 'globe' },
  { value: 'phone', label: 'Phone', icon: 'phone' },
  { value: 'chat', label: 'Chat', icon: 'message-circle' },
  { value: 'api', label: 'API', icon: 'code' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'message-square' },
  { value: 'social', label: 'Social Media', icon: 'share-2' },
  { value: 'monitoring', label: 'Monitoring', icon: 'activity' },
  { value: 'internal', label: 'Internal', icon: 'users' },
  { value: 'field_app', label: 'Field App', icon: 'smartphone' },
  { value: 'walk_in', label: 'Walk-in', icon: 'user' },
  { value: 'other', label: 'Other', icon: 'more-horizontal' }
]

export const TICKET_STATUSES = [
  'draft', 'submitted', 'new', 'accepted', 'assigned', 'acknowledged',
  'engineer en route', 'arrived on site', 'in progress', 'waiting customer',
  'waiting approval', 'waiting third party', 'waiting spare parts',
  'escalated', 'resolved', 'verification pending', 'customer review',
  'closed', 'cancelled', 'reopened', 'merged', 'duplicate'
]

export const TICKET_PRIORITIES = [
  'planning', 'low', 'medium', 'high', 'critical', 'emergency'
]

export const TICKET_CATEGORIES = [
  'hardware', 'software', 'network', 'server', 'storage',
  'database', 'cloud', 'security', 'access', 'email',
  'telephony', 'video_conference', 'printer', 'mobile_device',
  'application', 'erp', 'crm', 'website', 'billing',
  'inquiry', 'feature_request', 'bug', 'maintenance',
  'installation', 'training', 'other'
]

export const NAVIGATION_ITEMS = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/', icon: 'layout-dashboard' }
    ]
  },
  {
    title: 'Tickets',
    items: [
      { label: 'All Tickets', path: '/tickets', icon: 'ticket' },
      { label: 'Create Ticket', path: '/tickets/new', icon: 'plus-circle' },
      { label: 'Kanban Board', path: '/tickets/board', icon: 'kanban' }
    ]
  },
  {
    title: 'Field Service',
    items: [
      { label: 'Engineers', path: '/field-service/engineers', icon: 'users' },
      { label: 'Field Visits', path: '/field-service/visits', icon: 'map-pin' },
      { label: 'Route Planning', path: '/field-service/routes', icon: 'route' }
    ]
  },
  {
    title: 'Assets',
    items: [
      { label: 'All Assets', path: '/assets', icon: 'hard-drive' },
      { label: 'Warranties', path: '/assets/warranties', icon: 'shield-check' },
      { label: 'QR Codes', path: '/assets/qr-codes', icon: 'qr-code' }
    ]
  },
  {
    title: 'AMC',
    items: [
      { label: 'Contracts', path: '/amc/contracts', icon: 'file-text' },
      { label: 'Visits', path: '/amc/visits', icon: 'calendar' }
    ]
  },
  {
    title: 'Inventory',
    items: [
      { label: 'Parts', path: '/inventory/parts', icon: 'package' },
      { label: 'Stock Levels', path: '/inventory/stock', icon: 'bar-chart' },
      { label: 'Warehouses', path: '/inventory/warehouses', icon: 'building' }
    ]
  },
  {
    title: 'Knowledge Base',
    items: [
      { label: 'Articles', path: '/kb/articles', icon: 'book-open' },
      { label: 'Categories', path: '/kb/categories', icon: 'folder' }
    ]
  },
  {
    title: 'Reports',
    items: [
      { label: 'Analytics', path: '/reports/analytics', icon: 'pie-chart' },
      { label: 'SLA Performance', path: '/reports/sla', icon: 'timer' },
      { label: 'CSAT', path: '/reports/csat', icon: 'smile' }
    ]
  },
  {
    title: 'Admin',
    items: [
      { label: 'Settings', path: '/admin/settings', icon: 'settings' },
      { label: 'Users', path: '/admin/users', icon: 'users-round' },
      { label: 'Roles', path: '/admin/roles', icon: 'shield' },
      { label: 'Automation', path: '/admin/automation', icon: 'zap' },
      { label: 'Templates', path: '/admin/templates', icon: 'layout-template' }
    ]
  }
]
