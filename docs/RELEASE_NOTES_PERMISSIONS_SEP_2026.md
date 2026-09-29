# KAA Support Portal — Release Notes: User & Role Permissions Matrix
**Version / Period:** Late September 2026 Access Governance & Control Release  
**Audience:** Management, System Administrators, Company Admins & Operations Teams  

---

## 🌟 Executive Summary

This release introduces a centralized **User vs Permission Matrix**, giving administrators complete and visual control over which navigation menus and portal features are visible to each user and role.

To maintain operational integrity and simplify management, access is organized into **three clear tiers**:
1. **Tier 1 — Super Admin**: Unrestricted master scope across all 12 modules. These permissions are permanently protected and cannot be revoked or locked out.
2. **Tier 2 — Admin User Types**: Department heads and managerial roles (*Support Managers, Service Coordinators, Company Admins*). Administrators can easily toggle which menus are displayed for each admin role or customize individual accounts.
3. **Tier 3 — Normal Users**: Operational personnel and client staff (*Senior Field Engineers, Plant Managers, Client Requesters*). Configured with essential daily tools, customizable per role or per employee.

Both **role-wide defaults** and **individual user custom overrides** are supported, with immediate real-time updates and cloud synchronization.

---

## 🚀 Key Highlights & What Was Done

### 1. Three-Tier Access Hierarchy & Safeguards

The system now enforces a structured hierarchy across all user types:

* **Super Admin (Tier 1 — Master Scope)**:
  * Automatically receives all 12 portal menus (`*`).
  * Features visual lock badges in the matrix interface to prevent accidental removal of critical administration privileges.
* **Admin Roles (Tier 2 — Elevated Management)**:
  * **Support Manager**: Oversees internal service teams, equipment registries, and master data.
  * **Service Coordinator**: Schedules field dispatches, manages tickets, and reviews field reports.
  * **Company Admin**: Tenant administrator managing tickets, assets, and service contracts for their client company.
* **Normal User Roles (Tier 3 — Operational)**:
  * **Senior Field Engineer**: Accesses on-site field visits, ticket assignments, machinery manuals, and knowledge base.
  * **Plant Manager**: Tracks equipment health, machinery maintenance, and AMC contract visit quotas.
  * **Client Requester**: Submits new service tickets and tracks resolution progress.

---

### 2. The New "User vs Permissions" Matrix Interface

Located directly in **Admin Masters** under the **"User vs Permissions"** tab (or via direct shortcut `/admin/masters?tab=permissions`), the new screen provides two intuitive modes:

#### Mode A: Role vs Menu Permissions
* **Visual Tier Cards**: High-level summary of Super Admin, Admin user types, and Normal user types with active menu counters.
* **Interactive Switch Toggles**: Simple ON/OFF switches for each of the 12 system menus:
  * *Dashboard*, *Tickets*, *Raise Ticket*, *Engineers*, *Field Visits*, *Assets & Machinery*, *AMC Contracts*, *Company Master*, *Admin Masters*, *Reports & Analytics*, *Portal Settings*, and *Knowledge Base*.
* **Bulk Time-Savers**:
  * **Select All**: Grants all 12 menus with a single click.
  * **Clear**: Quickly trims access down to essential Dashboard view.
  * **Reset**: Restores the role to factory recommended defaults at any time.

#### Mode B: User vs Permissions (Individual User Overrides)
* **Searchable Employee Directory**: Search any team member or client user by name, email, or company.
* **Filter by Role or Company**: Quickly find all Plant Managers or all employees belonging to *ISS Global Forwarding W.L.L*.
* **Override Indicators**: Clearly shows whether a user is **"Inheriting Role Defaults"** or has a **"Custom User Override Active"**.
* **"Set Permissions" Modal**: Allows administrators to hand-pick specific menus for a particular person without having to change their official job title or create a separate role.
* **Revert with One Click**: A dedicated "Revert to Role Default" button removes personal customizations and re-links the user to standard role rules.

---

### 3. Clean & Dynamic Sidebar Experience

* **Zero Clutter**: When an employee logs in, the navigation sidebar automatically adapts. Only menus they are permitted to view appear on screen.
* **Smart Section Collapsing**: If an employee has no permissions in a section (e.g., *Administration & Masters*), the entire section header is hidden automatically.
* **Visible Role Tier Badge**: The sidebar footer clearly displays the logged-in user's role and tier:
  * Super Admin: `Super Admin (*)` with a shield badge.
  * Admin: `Admin • Support Manager` (or Company Admin) with an elevated badge.
  * Normal User: `ISS Global Forwarding W.L.L • Plant Manager` with an organization badge.

---

### 4. URL & Navigation Route Security

* **Automatic Route Guards**: If a user attempts to manually type a web address for a module they do not have access to (such as `/reports` or `/settings`), the portal automatically intercepts the request and safely redirects them to `/dashboard`.
* **Super Admin Unrestricted Access**: Super Admins can access all management pages and deep links seamlessly.

---

### 5. Instant Cloud & Offline Synchronization

* **Database-Backed Persistence**: Role permissions are saved directly to the central database in Supabase (`public.roles.permissions`), while personal overrides are recorded under `public.profiles.custom_permissions`.
* **Instant Activation**: Changes made in the permissions matrix take effect immediately without requiring a full system redeployment or server restart.
* **Fast Local Cache**: Saved settings are cached in browser storage to ensure instantaneous page loads.

---

## 🛠️ Summary Matrix of System Roles & Default Menus

| Role Name | Tier Level | Scope | Factory Default Menus Visible | Editable by Whom |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Tier 1 (Super Admin) | KAA Internal | **All 12 Menus** (Full System Scope `*`) | Locked / Full Scope Protected |
| **Support Manager** | Tier 2 (Admin) | KAA Internal | 11 Menus (Dashboard, Tickets, Raise Ticket, Engineers, Field Visits, Assets, AMC, Company Master, Admin Masters, Reports, KB) | Super Admin |
| **Service Coordinator** | Tier 2 (Admin) | KAA Internal | 9 Menus (Dashboard, Tickets, Raise Ticket, Engineers, Field Visits, Assets, AMC, Reports, KB) | Super Admin |
| **Company Admin** | Tier 2 (Admin) | Client User | 7 Menus (Dashboard, Tickets, Raise Ticket, Assets, AMC, Reports, KB) | Super Admin |
| **Senior Field Engineer**| Tier 3 (Normal User) | KAA Internal | 5 Menus (Dashboard, Tickets, Field Visits, Assets, KB) | Admins / Super Admin |
| **Plant Manager** | Tier 3 (Normal User) | Client User | 6 Menus (Dashboard, Tickets, Raise Ticket, Assets, AMC, KB) | Admins / Super Admin |
| **Client Requester** | Tier 3 (Normal User) | Client User | 4 Menus (Dashboard, Tickets, Raise Ticket, KB) | Admins / Super Admin |

---

## 📖 How to Use the New Permissions Menu

1. Log in with an administrator account.
2. In the left navigation, click on **Admin Masters**.
3. Select the **"User vs Permissions"** tab (with the shield icon).
4. **To adjust a whole role**: Stay on *Role vs Menu Permissions*, find the role card (e.g., *Service Coordinator* or *Company Admin*), and toggle the desired menu switches.
5. **To customize a specific person**: Click *User vs Permissions*, search for the user by name or company, click **Set Permissions**, toggle their individual menus, and click **Save User Permissions**.

---

*For assistance or additional custom role requests, please reach out to the KAA Portal Administration Team.*
