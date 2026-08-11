import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockEngineers, mockTickets } from '@/lib/mock-data';
import { UserCheck, MapPin, Star, Wrench, Mail, Search, CheckCircle2, Users, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function EngineersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<any>(null);
  const [addEngineerModalOpen, setAddEngineerModalOpen] = useState(false);
  const [newEngineerName, setNewEngineerName] = useState('');
  const [newEngineerRole, setNewEngineerRole] = useState('Senior PLC Engineer');

  const filteredEngineers = mockEngineers.filter((eng: any) =>
    eng.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eng.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eng.skills.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleAddEngineerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEngineerName.trim()) {
      toast.error('Please enter engineer name');
      return;
    }
    toast.success(`Engineer ${newEngineerName} onboarded`, {
      description: `Role assigned: ${newEngineerRole}. Credentials sent via SMS/Email.`
    });
    setAddEngineerModalOpen(false);
    setNewEngineerName('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Engineers Directory"
        description="Manage field engineers, skill sets, availability and location tracking"
      >
        <Button variant="default" onClick={() => setAddEngineerModalOpen(true)} className="gap-2">
          <UserCheck className="w-4 h-4" /> Add Engineer
        </Button>
      </PageHeader>

      <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search engineers by name, skill, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {filteredEngineers.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center border border-border flex flex-col items-center justify-center">
          <Users className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-bold text-foreground">No Field Engineers Onboarded</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">Click "Add Field Engineer" above to register service technicians and dispatch engineers.</p>
          <Button onClick={() => setAddEngineerModalOpen(true)} size="sm" className="mt-4 gap-2 text-xs">
            <UserPlus className="w-4 h-4" /> Add Field Engineer
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEngineers.map((engineer: any) => (
          <div key={engineer.id} className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all group flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <img src={engineer.avatar} alt={engineer.name} className="w-14 h-14 rounded-full border-2 border-primary/20 object-cover" />
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background ${
                    engineer.status === 'Available' ? 'bg-emerald-500' :
                    engineer.status === 'On Site' ? 'bg-amber-500' :
                    engineer.status === 'En Route' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                </div>
                <Badge variant={engineer.status === 'Available' ? 'success' : 'secondary'}>
                  {engineer.status}
                </Badge>
              </div>

              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{engineer.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{engineer.role}</p>

              <div className="space-y-2 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{engineer.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-400" />
                  <span className="font-medium text-foreground">{engineer.rating}</span>
                  <span>({engineer.completedVisits} visits)</span>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Skills</span>
                <div className="flex flex-wrap gap-1">
                  {engineer.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-secondary border border-border text-foreground">
                      {skill}
                    </span>
                  ))}
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
                <Wrench className="w-3.5 h-3.5" /> Assign Ticket
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
              Select an unassigned or pending ticket to dispatch to {selectedEngineer?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {mockTickets.slice(0, 4).map((ticket) => (
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
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Engineer Modal */}
      <Dialog open={addEngineerModalOpen} onOpenChange={setAddEngineerModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Onboard New Field Engineer</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Register a new field staff profile and assign specialization skills.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddEngineerSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Full Name</label>
              <input 
                type="text" 
                value={newEngineerName}
                onChange={(e) => setNewEngineerName(e.target.value)}
                placeholder="E.g., Marcus Vance"
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Role / Specialization</label>
              <select 
                value={newEngineerRole}
                onChange={(e) => setNewEngineerRole(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              >
                <option value="Senior PLC Engineer">Senior PLC Engineer</option>
                <option value="Hardware Specialist">Hardware Specialist</option>
                <option value="Network Technician">Network Technician</option>
                <option value="HVAC Systems Specialist">HVAC Systems Specialist</option>
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
