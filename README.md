# KAA Support — Enterprise ERP Service & Operations Portal

A modern, production-grade Multi-Tenant ERP Support and Field Service Operations Portal built for **KAA**. This platform manages end-to-end industrial automation support tickets, asset lifecycles, Annual Maintenance Contracts (AMC), spare parts inventory, field engineer dispatches, and executive SLA compliance reporting.

---

## 🚀 Key Highlights & Architectural Overview

- **Multi-Tenant Row-Level Security (RLS)**: Full client isolation ensuring client companies only see their assigned tickets, machinery assets, and AMC quotas, while KAA Admin and Internal Staff retain global operational command.
- **Role-Based Permission Matrix**:
  - **Client / Normal Users**: Ticket creation, **View Details**, **Edit Ticket** (Title, Severity Priority, Description), and **Re-open Ticket** on resolved/closed issues.
  - **KAA Internal Staff & Admins**: Full lifecycle actions (**Start Progress**, **Mark Resolved**, **Re-open**, Engineer Assignment, Asset/Contract Management, and Master Data Controls).
- **Zero Mock Data Policy**: All dashboard KPIs, priority distributions, 14-day activity trend charts, and response times are computed dynamically in real time from live data.
- **Resilient & Crash-Proof**: Wrapped with a global React `ErrorBoundary` and safe date/number parsers preventing blank screens across route transitions and state hydrations.
- **Official Export & Document Generators**: Real printable Executive PDF summaries, printable AMC SLA Agreement contracts, and one-click `.csv` spreadsheet data downloads.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + TypeScript (Strict Mode) |
| **Build & Tooling** | Vite 8.2 + Rolldown Bundler |
| **Styling & Design** | Tailwind CSS + Radix UI Primitives + Lucide Icons + Sonner Toasts |
| **State Management** | Zustand (`useMasterStore`, `useAuthStore`, `useUIStore`) + LocalStorage Persistence |
| **Data Fetching & Cache** | TanStack Query v5 |
| **Data Visualization** | Recharts (Area Charts, Line Charts, Donut Charts, Bar Charts) |
| **Backend & Database** | Supabase PostgreSQL (`pqiboqctyzvjdxqtxilp.supabase.co`) + Supabase Auth |

---

## 📂 Core Modules & Features

### 1. Executive Operations Command (Dashboard)
- **Real-Time KPIs**: Total Tickets, Active Open Issues, Average Field Response Time, and SLA Compliance Rate.
- **Dynamic Response Time**: Evaluates dispatcher queues (`< 1 hr` under active SLA) and computes real average resolution time once issues are resolved.
- **Dynamic 14-Day Volume Chart**: Area chart mapping ticket volume by exact date of creation.
- **Priority Breakdown**: Dynamic severity distribution (`Critical`, `High`, `Medium`, `Low`).
- **Export Executive Summary**: One-click printable PDF document window with KAA branding, SLA stats, and ticket logs.

### 2. Support Tickets Management
- **List & Table View**: Clean, high-density responsive table with dedicated column spacing (`min-w-[950px]`).
- **Kanban Board**: Drag-and-drop workflow across `Open`, `In Progress`, `Waiting on Customer`, and `Resolved`.
- **Ticket Actions**:
  - **Client Scope**: 👁️ *View Details*, ✏️ *Edit Ticket* (Title, Description, Priority modal), 🔄 *Re-open Ticket*.
  - **Staff Scope**: 👁️ *View Details*, ✏️ *Edit Ticket*, ⚡ *Mark In Progress*, ✅ *Mark Resolved*, 🔄 *Re-open Ticket*.
- **Real CSV Export**: Downloads structured `.csv` files formatted with ticket IDs, client details, priorities, assignees, and timestamps.

### 3. Assets & Machinery Catalog
- Industrial machinery registry (PLCs, VFDs, Robotic Arms, CNCs, Conveyors).
- Serial number tracking, location mapping, warranty status, and QR code identifiers.

### 4. Annual Maintenance Contracts (AMC)
- Preventative maintenance visit quotas (Total vs Used tracking with visual progress indicators).
- Labor inclusion coverage flags and expiration alerts.
- **Printable PDF Agreement Generator**: Produces formatted AMC SLA agreements with authorized signature and company stamp blocks.

### 5. Spare Parts Inventory & Stock Reservation
- Catalog of automation spare parts (Part Number, SKU, Unit Price, Stock on Hand, Reserved Stock, Min Stock Threshold).
- Low-stock visual badges and automated Purchase Order (PO) triggers.
- Direct stock reservation tied to active ticket resolutions.

### 6. Field Operations & Engineers
- Field engineering roster with active availability, specialization roles, and skill ratings.
- Direct dispatch and ticket assignment modals.

### 7. Knowledge Base (KB)
- Technical articles, troubleshooting SOPs, and manual upload with category filtering and interactive reading view.

### 8. Admin Masters & User Provisioning
- **Company Onboarding**: Register client organizations with unique company codes.
- **User Provisioning & Credentials**: Create users mapped to companies with initial default passwords.
- **Fallback Authentication**: Built-in credential verification allowing newly created users to log in immediately even before remote email confirmation.
- **Password Reset**: Admin password reset modal for instant user credential updates.

### 9. Analytics & Monthly Reports
- Monthly resolution breakdown with response vs resolution SLA compliance.
- One-click executive PDF report generator with automated print dialog.
- Monthly `.csv` data export.

---

## 🗄️ Database & Supabase Integration

- **Project Ref**: `pqiboqctyzvjdxqtxilp`
- **Project URL**: `https://pqiboqctyzvjdxqtxilp.supabase.co`
- **Region**: `ap-northeast-2`
- **Core Tables**:
  - `public.profiles` & `public.users`
  - `public.companies`
  - `public.tickets`
  - `public.assets`
  - `public.amc_contracts`
  - `public.parts` & `public.inventory_parts`
  - `public.kb_articles`
  - `public.field_visits`

---

## ⚙️ Setup & Local Development

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/jerinjacobai/KAASUPPORT.git
cd KAA_TICKETS

# 2. Install dependencies
npm install

# 3. Configure environment variables (.env)
VITE_SUPABASE_URL=https://pqiboqctyzvjdxqtxilp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 4. Start the local development server
npm run dev
```

### Production Build & Linting
```bash
# Type check and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🔒 Security & Access Control

1. **Client Isolation**: Client accounts are strictly locked to their `mappedCompany`. Queries automatically filter data to prevent cross-tenant exposure.
2. **Protected Routes**: React Router route guard (`ProtectedRoute`) ensures unauthenticated requests redirect to `/login`.
3. **Session Inactivity Timeout**: Automatically terminates idle sessions after 10 minutes of inactivity for enterprise data protection.
4. **No Plaintext API Keys**: Sensitive tokens and Supabase connection secrets are removed from the client UI.

---

## 📦 Version History & Changelog

- **v1.2.0**:
  - Fixed ticket table alignment and scrollbar overlap (`min-w-[950px]`).
  - Restricted client user actions strictly to **View Details**, **Edit Ticket**, and **Re-open Ticket**.
  - Added built-in **Edit Ticket Modal** for editing title, description, and severity.
  - Replaced hardcoded response times and mock chart data with 100% dynamic calculations.
  - Implemented real `.csv` file download export for tickets and reports.
  - Added React `ErrorBoundary` preventing blank screen crashes on navigation.
  - Integrated printable PDF Executive Summary and AMC SLA Agreement generators.
- **v1.1.0**:
  - Purged all hardcoded seed data, fake names, and avatar placeholder URLs.
  - Added persistent spare parts inventory and knowledge base in master store.
  - Enabled direct login fallback for users created in Admin Masters.
- **v1.0.0**:
  - Initial Multi-Tenant KAA Support Portal release with Kanban, Assets, and AMC contracts.
