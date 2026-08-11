import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Settings, Shield, Bell, Palette, CheckCircle2, Send, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [portalName, setPortalName] = useState('KAA Support Portal');
  const [supportEmail, setSupportEmail] = useState('support@kaa.com');

  const handleSaveSettings = () => {
    toast.success('System Settings Saved!', {
      description: 'Configuration updated across all regional hubs.'
    });
  };

  const handleTestWhatsApp = () => {
    toast.success('Test WhatsApp Alert Sent', {
      description: 'Dispatched test template message via WhatsApp Business API.'
    });
  };

  const handleTestEmail = () => {
    toast.success('Test Email Notification Sent', {
      description: 'Dispatched SMTP email notification to support@kaa.com.'
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin & System Settings"
        description="Configure ticket statuses, automation rules, RLS multi-tenancy, and notifications"
      >
        <Button variant="default" onClick={handleSaveSettings} className="gap-2">
          <Save className="w-4 h-4" /> Save System Configuration
        </Button>
      </PageHeader>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-secondary/40 p-1 border border-border rounded-xl">
          <TabsTrigger value="general" className="gap-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"><Settings className="w-3.5 h-3.5" /> General & Branding</TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"><Shield className="w-3.5 h-3.5" /> Multi-Tenant RLS</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"><Bell className="w-3.5 h-3.5" /> Notification Channels</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <div className="glass rounded-xl p-6 border border-border space-y-4 shadow-lg hover:border-primary/30 transition-all duration-300">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" /> Portal Branding & Customization
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <label className="font-medium text-xs">Portal Name</label>
                <input 
                  type="text" 
                  value={portalName}
                  onChange={(e) => setPortalName(e.target.value)}
                  className="w-full bg-secondary/50 border border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg p-2.5 text-sm outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="font-medium text-xs">Support Email</label>
                <input 
                  type="email" 
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full bg-secondary/50 border border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg p-2.5 text-sm outline-none transition-all" 
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={handleSaveSettings} className="gap-1 text-xs">
                <Save className="w-3.5 h-3.5" /> Update Branding
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <div className="glass rounded-xl p-6 border border-border space-y-4 shadow-lg hover:border-primary/30 transition-all duration-300">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Supabase Row-Level Security (RLS) Status
            </h3>
            <p className="text-xs text-muted-foreground">
              Multi-tenant company data isolation enforced across PostgreSQL schema tables.
            </p>
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>RLS Active for all tenant tables via `kaa.current_user_company_ids()` helper function.</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <div className="glass rounded-xl p-6 border border-border space-y-4 shadow-lg hover:border-primary/30 transition-all duration-300">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Automated SLA & Ticket Alert Channels
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50">
                <div>
                  <h4 className="font-medium text-sm">Email Alerts (SMTP / Resend)</h4>
                  <p className="text-xs text-muted-foreground">Send ticket updates & SLA breach alerts via email</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="outline" onClick={handleTestEmail} className="text-xs gap-1">
                    <Send className="w-3 h-3 text-primary" /> Test
                  </Button>
                  <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50">
                <div>
                  <h4 className="font-medium text-sm">WhatsApp Business Integration</h4>
                  <p className="text-xs text-muted-foreground">Notify client contacts on WhatsApp when ticket status changes</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="outline" onClick={handleTestWhatsApp} className="text-xs gap-1">
                    <Send className="w-3 h-3 text-emerald-400" /> Test
                  </Button>
                  <Switch checked={whatsappAlerts} onCheckedChange={setWhatsappAlerts} />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-4 border-t border-border flex justify-end gap-3">
        <Button variant="outline" size="sm" onClick={() => toast.info('Changes discarded')} className="text-xs">
          Reset Changes
        </Button>
        <Button variant="default" size="sm" onClick={() => toast.success('System Settings Saved Successfully!')} className="text-xs gap-2">
          <Save className="w-4 h-4" /> Save Configuration
        </Button>
      </div>
    </div>
  );
}
