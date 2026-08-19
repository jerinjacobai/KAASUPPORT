import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { UserCheck, MapPin, Star, Wrench, Mail, Search, CheckCircle2, Users, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMasterStore } from '@/stores/master-store';
import { hashPassword } from '@/lib/crypto';
import { Link } from 'react-router-dom';

export default function EngineersPage() {
  const { users, tickets, addUser } = useMasterStore();
  const engineersList = users.filter(u => u.roleType === 'KAA Internal Staff');

  const [searchTerm, setSearchTerm] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<any>(null);
  const [addEngineerModalOpen, setAddEngineerModalOpen] = useState(false);
  const [newEngineerName, setNewEngineerName] = useState('');
  const [newEngineerEmail, setNewEngineerEmail] = useState('');
  const [newEngineerRole, setNewEngineerRole] = useState('Senior Field Engineer');

  const filteredEngineers = engineersList.filter((eng: any) =>
    eng.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eng.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eng.roleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAssignModal = (engineer: any) => {
    setSelectedEngineer(engineer);
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = (ticketId: string) => {
    toast.success(`Assigned ticket ${ticketId}`, {
      description: `Dispatch notification sent to ${selectedEngineer?.name}.`
    });
    setAssignModalOpen(false);
  };

  const handleSendMessage = (engineerName: string) => {
    toast.info(`Message sent to ${engineerName}`, {
      description: 'Opening encrypted KAA Engineer Chat session...'
    });
  };

  const [isSubmittingEng, setIsSubmittingEng] = useState(false);

  const handleAddEngineerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingEng) return;
    if (!newEngineerName.trim() || !newEngineerEmail.trim()) {
      toast.error('Please enter engineer name and email');
      return;
    }

    setIsSubmittingEng(true);
    try {
      const defaultPass = 'KaaPass2026!#';
      const computedHash = await hashPassword(defaultPass);

      const created = addUser({
        name: newEngineerName.trim(),
        email: newEngineerEmail.trim(),
        roleType: 'KAA Internal Staff',
        roleName: newEngineerRole,
        mappedCompany: 'Global (All Companies)',
        status: 'Active',
        passwordHash: computedHash,
        isPasswordResetRequired: true
      });

      toast.success(`Engineer ${created.name} onboarded`, {
        description: `Role assigned: ${newEngineerRole}. Scoped globally for dispatch.`
      });
      setAddEngineerModalOpen(false);
      setNewEngineerName('');
      setNewEngineerEmail('');
    } catch {
      toast.error('Failed to onboard engineer');
    } finally {
      setIsSubmittingEng(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Engineers Directory"
        description="Manage field engineers, skill sets, availability and location tracking"
      >
        <Button variant="default" onClick={() => setAddEngineerModalOpen(true)} className="gap-2 text-xs">
          <UserCheck className="w-4 h-4" /> Add Field Engineer
        </Button>
      </PageHeader>

      <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search engineers by name, role, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary text-foreground"
          />
        </div>
      </div>

      {filteredEngineers.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center border border-border flex flex-col items-center justify-center">
          <Users className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-bold text-foreground">No Field Engineers Onboarded</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Click "Add Field Engineer" above or onboard KAA Internal Staff in Admin Masters to populate your field engineering team.
          </p>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => setAddEngineerModalOpen(true)} size="sm" className="gap-2 text-xs">
              <UserPlus className="w-4 h-4" /> Add Field Engineer
            </Button>
            <Link to="/masters">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                Go to Admin Masters
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEngineers.map((engineer: any) => (
            <div key={engineer.id} className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all group flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-primary/20 bg-primary/10 text-primary font-bold text-xl flex items-center justify-center">
                      {engineer.name.charAt(0)}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background bg-emerald-500" />
                  </div>
                  <Badge variant="success">
                    {engineer.status}
                  </Badge>
                </div>

                <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">{engineer.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{engineer.roleName}</p>

                <div className="space-y-2 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Global Field Scope</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-400" />
                    <span className="font-medium text-foreground">5.0</span>
                    <span>(0 visits)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSendMessage(engineer.name)}
                  className="w-full text-xs gap-1"
                >
                  <Mail className="w-3.5 h-3.5" /> Message
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => handleOpenAssignModal(engineer)}
                  className="w-full text-xs gap-1"
                >
                  <Wrench className="w-3.5 h-3.5" /> Assign
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Ticket Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" /> Assign Ticket to {selectedEngineer?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select an unassigned ticket to dispatch to {selectedEngineer?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {tickets.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 text-center">No active tickets available for dispatch.</p>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="p-3 bg-secondary/50 rounded-lg border border-border flex items-center justify-between hover:border-primary/50 transition-colors">
                  <div>
                    <span className="font-mono text-xs font-bold text-primary">{ticket.id}</span>
                    <p className="text-xs font-medium text-foreground truncate max-w-[220px]">{ticket.title}</p>
                    <p className="text-[10px] text-muted-foreground">{ticket.company}</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleConfirmAssign(ticket.id)}
                    className="text-xs gap-1 py-1 h-8"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Assign
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Engineer Modal */}
      <Dialog open={addEngineerModalOpen} onOpenChange={setAddEngineerModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Onboard New Field Engineer</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Register a new field staff profile.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddEngineerSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Full Name *</label>
              <input 
                type="text" 
                value={newEngineerName}
                onChange={(e) => setNewEngineerName(e.target.value)}
                placeholder="E.g., Marcus Vance"
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Email Address *</label>
              <input 
                type="email" 
                value={newEngineerEmail}
                onChange={(e) => setNewEngineerEmail(e.target.value)}
                placeholder="marcus@kaasupport.com"
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Role / Designation</label>
              <select 
                value={newEngineerRole}
                onChange={(e) => setNewEngineerRole(e.target.value)}
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              >
                <option value="Senior Field Engineer">Senior Field Engineer</option>
                <option value="Service Coordinator">Service Coordinator</option>
                <option value="Support Manager">Support Manager</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddEngineerModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs">
                Save & Onboard
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
