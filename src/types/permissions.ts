export type MenuId = 
  | 'dashboard'
  | 'tickets'
  | 'tickets_new'
  | 'engineers'
  | 'field_visits'
  | 'assets'
  | 'amc'
  | 'company_master'
  | 'admin_masters'
  | 'reports'
  | 'settings'
  | 'knowledge_base';

export type RoleTier = 'super_admin' | 'admin' | 'user';

export interface MenuDefinition {
  id: MenuId;
  name: string;
  path: string;
  category: 'Overview' | 'Support Desk' | 'Assets & Contracts' | 'Administration & Masters' | 'Help & Knowledge';
  description: string;
  defaultRoles: string[];
}

export interface RoleInfo {
  name: string;
  tier: RoleTier;
  tierLabel: 'Super Admin' | 'Admin' | 'Normal User';
  accountScope: 'KAA Internal Staff' | 'Client User';
  description: string;
  badgeVariant: 'destructive' | 'warning' | 'default' | 'secondary';
}

export const MENU_DEFINITIONS: MenuDefinition[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    category: 'Overview',
    description: 'Central overview, active tickets KPI, and operation stats',
    defaultRoles: [
      'Super Admin',
      'Support Manager',
      'Service Coordinator',
      'Company Admin',
      'Plant Manager',
      'Senior Field Engineer',
      'Client Requester'
    ]
  },
  {
    id: 'tickets',
    name: 'Tickets',
    path: '/tickets',
    category: 'Support Desk',
    description: 'Ticket list, status tracking, filters, and ticket details',
    defaultRoles: [
      'Super Admin',
      'Support Manager',
      'Service Coordinator',
      'Company Admin',
      'Plant Manager',
      'Senior Field Engineer',
      'Client Requester'
    ]
  },
  {
    id: 'tickets_new',
    name: 'Raise Ticket',
    path: '/tickets/new',
    category: 'Support Desk',
    description: 'Create and log new customer support or service tickets',
    defaultRoles: [
      'Super Admin',
      'Support Manager',
      'Service Coordinator',
      'Company Admin',
      'Plant Manager',
      'Client Requester'
    ]
  },
  {
    id: 'engineers',
    name: 'Engineers',
    path: '/engineers',
    category: 'Support Desk',
    description: 'Engineer roster, specialties, and active field assignments',
    defaultRoles: [
      'Super Admin',
      'Support Manager',
      'Service Coordinator'
    ]
  },
  {
    id: 'field_visits',
    name: 'Field Visits',
    path: '/field-visits',
    category: 'Support Desk',
    description: 'Field visit scheduling, GPS check-ins, customer signatures, and PDF reports',
    defaultRoles: [
      'Super Admin',
      'Support Manager',
      'Service Coordinator',
      'Senior Field Engineer'
    ]
  },
  {
    id: 'assets',
    name: 'Assets & Machinery',
    path: '/assets',
    category: 'Assets & Contracts',
    description: 'Machinery assets, hardware tags, models, warranty and provisioning',
    defaultRoles: [
      'Super Admin',
      'Support Manager',
      'Service Coordinator',
      'Company Admin',
      'Plant Manager',
      'Senior Field Engineer'
    ]
  },
  {
    id: 'amc',
    name: 'AMC Contracts',
    path: '/amc',
    category: 'Assets & Contracts',
    description: 'Annual Maintenance Contracts, visit quotas, and validity',
    defaultRoles: [
      'Super Admin',
      'Support Manager',
      'Service Coordinator',
      'Company Admin',
      'Plant Manager'
    ]
  },
  {
    id: 'company_master',
    name: 'Company Master',
    path: '/admin/masters?tab=companies',
    category: 'Administration & Masters',
    description: 'Manage client companies, company codes, and corporate profiles',
    defaultRoles: [
      'Super Admin',
      'Support Manager'
    ]
  },
  {
    id: 'admin_masters',
    name: 'Admin Masters',
    path: '/admin/masters',
    category: 'Administration & Masters',
    description: 'Core registries: Users, Roles, Hardware Types, and Permissions Matrix',
    defaultRoles: [
      'Super Admin',
      'Support Manager'
    ]
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    path: '/reports',
    category: 'Administration & Masters',
    description: 'SLA compliance, MTTR performance, ticket volume and trends',
    defaultRoles: [
      'Super Admin',
      'Support Manager',
      'Company Admin'
    ]
  },
  {
    id: 'settings',
    name: 'Portal Settings',
    path: '/settings',
    category: 'Administration & Masters',
    description: 'System configurations, notifications, and portal branding',
    defaultRoles: [
      'Super Admin'
    ]
  },
  {
    id: 'knowledge_base',
    name: 'Knowledge Base',
    path: '/knowledge-base',
    category: 'Help & Knowledge',
    description: 'Articles, standard troubleshooting guides, and documentation',
    defaultRoles: [
      'Super Admin',
      'Support Manager',
      'Service Coordinator',
      'Company Admin',
      'Plant Manager',
      'Senior Field Engineer',
      'Client Requester'
    ]
  }
];

export const ALL_ROLES: RoleInfo[] = [
  {
    name: 'Super Admin',
    tier: 'super_admin',
    tierLabel: 'Super Admin',
    accountScope: 'KAA Internal Staff',
    description: 'Unrestricted master scope across all modules and client accounts (*)',
    badgeVariant: 'destructive'
  },
  {
    name: 'Support Manager',
    tier: 'admin',
    tierLabel: 'Admin',
    accountScope: 'KAA Internal Staff',
    description: 'Internal operations management, engineer assignments, and master governance',
    badgeVariant: 'warning'
  },
  {
    name: 'Service Coordinator',
    tier: 'admin',
    tierLabel: 'Admin',
    accountScope: 'KAA Internal Staff',
    description: 'Coordinates field visits, dispatching, and ticket triage',
    badgeVariant: 'warning'
  },
  {
    name: 'Company Admin',
    tier: 'admin',
    tierLabel: 'Admin',
    accountScope: 'Client User',
    description: 'Client tenant administrator with access to organization tickets, assets, and reports',
    badgeVariant: 'warning'
  },
  {
    name: 'Senior Field Engineer',
    tier: 'user',
    tierLabel: 'Normal User',
    accountScope: 'KAA Internal Staff',
    description: 'Executes on-site maintenance, field visits, and equipment diagnostics',
    badgeVariant: 'secondary'
  },
  {
    name: 'Plant Manager',
    tier: 'user',
    tierLabel: 'Normal User',
    accountScope: 'Client User',
    description: 'Oversees plant machinery, AMC coverage, and maintenance requests',
    badgeVariant: 'secondary'
  },
  {
    name: 'Client Requester',
    tier: 'user',
    tierLabel: 'Normal User',
    accountScope: 'Client User',
    description: 'Standard client employee authorized to report issues and view their tickets',
    badgeVariant: 'secondary'
  }
];

// Helper to compute initial default permissions for each role
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  'Super Admin': MENU_DEFINITIONS.map(m => m.id),
  'Support Manager': [
    'dashboard',
    'tickets',
    'tickets_new',
    'engineers',
    'field_visits',
    'assets',
    'amc',
    'company_master',
    'admin_masters',
    'reports',
    'knowledge_base'
  ],
  'Service Coordinator': [
    'dashboard',
    'tickets',
    'tickets_new',
    'engineers',
    'field_visits',
    'assets',
    'amc',
    'reports',
    'knowledge_base'
  ],
  'Company Admin': [
    'dashboard',
    'tickets',
    'tickets_new',
    'assets',
    'amc',
    'reports',
    'knowledge_base'
  ],
  'Senior Field Engineer': [
    'dashboard',
    'tickets',
    'field_visits',
    'assets',
    'knowledge_base'
  ],
  'Plant Manager': [
    'dashboard',
    'tickets',
    'tickets_new',
    'assets',
    'amc',
    'knowledge_base'
  ],
  'Client Requester': [
    'dashboard',
    'tickets',
    'tickets_new',
    'knowledge_base'
  ]
};

export const getRoleInfo = (roleName?: string | null): RoleInfo => {
  const normalized = (roleName || '').trim();
  const matched = ALL_ROLES.find(r => r.name.toLowerCase() === normalized.toLowerCase());
  if (matched) return matched;

  // Fallback heuristic based on name
  if (normalized.toLowerCase().includes('admin')) {
    return {
      name: normalized || 'Admin',
      tier: 'admin',
      tierLabel: 'Admin',
      accountScope: 'Client User',
      description: 'Administrative user scope',
      badgeVariant: 'warning'
    };
  }

  return {
    name: normalized || 'User',
    tier: 'user',
    tierLabel: 'Normal User',
    accountScope: 'Client User',
    description: 'Standard user scope',
    badgeVariant: 'secondary'
  };
};
