import { PageHeader } from '@/components/shared/PageHeader';
import { Settings, Shield, Bell, Key, Palette } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin & System Settings"
        description="Configure ticket statuses, automation rules, RLS multi-tenancy, and Supabase integration"
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-secondary/40 p-1 border border-border rounded-xl">
          <TabsTrigger value="general" className="gap-2 text-xs"><Settings className="w-3.5 h-3.5" /> General & Branding</TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs"><Shield className="w-3.5 h-3.5" /> Multi-Tenant RLS</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 text-xs"><Bell className="w-3.5 h-3.5" /> Notification Channels</TabsTrigger>
          <TabsTrigger value="api" className="gap-2 text-xs"><Key className="w-3.5 h-3.5" /> API Keys & Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <div className="glass rounded-xl p-6 border border-border space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" /> Portal Branding & Customization
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <label className="font-medium text-xs">Portal Name</label>
                <input type="text" defaultValue="KAA Support Portal" className="w-full bg-background border border-border rounded-lg p-2.5 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="font-medium text-xs">Support Email</label>
                <input type="email" defaultValue="support@kaa.com" className="w-full bg-background border border-border rounded-lg p-2.5 text-sm" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <div className="glass rounded-xl p-6 border border-border space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Supabase Row-Level Security (RLS) Status
            </h3>
            <p className="text-xs text-muted-foreground">
              Multi-tenant company data isolation enforced across 15 PostgreSQL schema tables.
            </p>
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              ✓ RLS Active for all tenant tables via `kaa.current_user_company_ids()` helper function.
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <div className="glass rounded-xl p-6 border border-border space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Automated SLA & Ticket Alert Channels
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div>
                  <h4 className="font-medium text-sm">Email Alerts (SMTP / Resend)</h4>
                  <p className="text-xs text-muted-foreground">Send ticket updates & SLA breach alerts via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div>
                  <h4 className="font-medium text-sm">WhatsApp Business Integration</h4>
                  <p className="text-xs text-muted-foreground">Notify client contacts on WhatsApp when ticket status changes</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api" className="mt-6 space-y-6">
          <div className="glass rounded-xl p-6 border border-border space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> Supabase Connection & API Token
            </h3>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-muted-foreground">SUPABASE_URL</label>
                <input type="text" readOnly value="https://placeholder.supabase.co" className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-muted-foreground mt-1" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
