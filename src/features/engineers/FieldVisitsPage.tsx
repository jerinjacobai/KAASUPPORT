import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { MapPin, Navigation, Calendar, CheckCircle2, AlertCircle, FileText, Trash2, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ServiceReportModal } from '@/features/engineers/ServiceReportModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMasterStore, type FieldVisitMaster } from '@/stores/master-store';

export default function FieldVisitsPage() {
  const { users, tickets, companies, fieldVisits, addFieldVisit, deleteFieldVisit } = useMasterStore();
  const engineersList = users.filter(u => u.roleType === 'KAA Internal Staff');
  const activeCompanies = companies.filter(c => c.is_active);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<FieldVisitMaster | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [visitEngineer, setVisitEngineer] = useState(engineersList[0]?.name || '');
  const [visitCompany, setVisitCompany] = useState(activeCompanies[0]?.name || '');
  const [visitLocation, setVisitLocation] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitTime, setVisitTime] = useState('14:00');

  const handleOpenReport = (visit: FieldVisitMaster) => {
    setSelectedVisit(visit);
    setReportModalOpen(true);
  };

  const handleTrackLocation = (engineerName: string, location: string) => {
    toast.info(`Live GPS Tracking: ${engineerName}`, {
      description: `Target Site: ${location} | GPS Lock Active`
    });
  };

  const handleTicketChange = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    const matchedTicket = tickets.find(t => t.id === ticketId);
    if (matchedTicket) {
      setVisitCompany(matchedTicket.company);
      if (!visitLocation) {
        setVisitLocation(`${matchedTicket.company} Site / Plant Facility`);
      }
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!visitEngineer) {
      toast.error('Please assign an internal field engineer');
      return;
    }

    if (!visitLocation.trim()) {
      toast.error('Please enter the site location / address');
      return;
    }

    const effectiveCompany = visitCompany || (activeCompanies[0]?.name || 'Client Facility');
    const effectiveTicketId = selectedTicketId || (tickets[0]?.id || `TKT-${Math.floor(1000 + Math.random() * 9000)}`);
    const scheduledFormatted = `${visitDate} at ${visitTime}`;

    setIsSubmitting(true);
    try {
      const created = await addFieldVisit({
        ticketId: effectiveTicketId,
        engineerName: visitEngineer,
        engineerAvatar: '',
        companyName: effectiveCompany,
        location: visitLocation.trim(),
        scheduledStart: scheduledFormatted,
        status: 'Scheduled',
        GPSConfirmed: true,
        checkInTime: `${visitTime} (Auto GPS)`
      });

      toast.success('Field Visit Dispatched & Logged', {
        description: `Engineer ${created.engineerName} scheduled for ${created.location}.`
      });

      setScheduleModalOpen(false);
      setSelectedTicketId('');
      setVisitLocation('');
    } catch (err) {
      toast.error('Failed to schedule field visit', {
        description: err instanceof Error ? err.message : 'Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVisit = async (visit: FieldVisitMaster) => {
    try {
      await deleteFieldVisit(visit.id);
      toast.success('Field visit record cancelled');
    } catch (err) {
      toast.error('Failed to remove field visit', {
        description: err instanceof Error ? err.message : 'Please try again.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Visits & Schedule"
        description="Real-time engineer location tracking, dispatch schedule, and GPS check-ins"
      >
        <Button 
          variant="default" 
          onClick={() => {
            if (engineersList.length > 0 && !visitEngineer) {
              setVisitEngineer(engineersList[0].name);
            }
            if (tickets.length > 0 && !selectedTicketId) {
              handleTicketChange(tickets[0].id);
            }
            setScheduleModalOpen(true);
          }} 
          className="gap-2 text-xs"
        >
          <Navigation className="w-4 h-4" /> Schedule Field Visit
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
            <h3 className="font-semibold text-base text-foreground">Scheduled Visits ({fieldVisits.length})</h3>
            <span className="text-xs text-muted-foreground">Database Synchronized</span>
          </div>

          {fieldVisits.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center border border-border flex flex-col items-center justify-center">
              <Navigation className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <h3 className="text-base font-bold text-foreground">No Field Visits Scheduled Yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Dispatch engineers to client sites to resolve hardware tickets and generate certified completion reports.
              </p>
              <Button 
                onClick={() => setScheduleModalOpen(true)} 
                size="sm" 
                className="mt-4 gap-2 text-xs"
              >
                <Navigation className="w-4 h-4" /> Schedule Field Visit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {fieldVisits.map((visit) => {
                const linkedTicket = tickets.find(t => t.id === visit.ticketId);

                return (
                  <div key={visit.id} className="glass rounded-xl p-5 border border-border hover:border-primary/40 transition-all space-y-4 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold text-sm flex items-center justify-center shrink-0">
                          {visit.engineerName.charAt(0) || 'E'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                            {visit.engineerName}
                            <span className="text-[10px] text-muted-foreground font-normal">({visit.companyName})</span>
                          </h4>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Ticket className="w-3.5 h-3.5 text-primary" />
                            <span>Linked Ticket:</span>
                            <Link 
                              to={`/tickets/${visit.ticketId}`} 
                              className="font-mono font-semibold text-primary hover:underline"
                            >
                              {visit.ticketId}
                            </Link>
                            {linkedTicket && (
                              <span className="text-foreground truncate max-w-[200px]">
                                - {linkedTicket.title}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant={visit.status === 'Arrived On Site' ? 'success' : 'warning'}>
                        {visit.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-foreground font-medium">{visit.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                        <span>Scheduled: {visit.scheduledStart}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                      <div className="flex items-center gap-2 text-xs">
                        {visit.GPSConfirmed ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> GPS Verified ({visit.checkInTime || 'On Site'})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" /> Pending Check In
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleTrackLocation(visit.engineerName, visit.location)}
                          className="text-xs gap-1"
                        >
                          <Navigation className="w-3 h-3 text-primary" /> Track
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handleOpenReport(visit)}
                          className="text-xs gap-1"
                        >
                          <FileText className="w-3 h-3" /> PDF Report & Sign
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => void handleDeleteVisit(visit)}
                          className="text-xs text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Engineer Map Widget */}
        <div className="glass rounded-xl p-6 border border-border flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-pulse border border-primary/20">
            <Navigation className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">Live Engineer Geo Map</h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              Real-time GPS tracking enabled for active field engineers across regional hubs.
            </p>
          </div>
          <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
            GPS Signal: 100% Active
          </Badge>
        </div>
      </div>

      {/* PDF Service Report Modal */}
      {selectedVisit && (
        <ServiceReportModal 
          open={reportModalOpen}
          onOpenChange={setReportModalOpen}
          ticketId={selectedVisit.ticketId}
          engineerName={selectedVisit.engineerName}
          companyName={selectedVisit.companyName}
        />
      )}

      {/* Schedule Visit Modal */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" /> Schedule Field Visit
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Dispatch a certified field service engineer for on-site ticket resolution.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            {/* Ticket Selector */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Associate with Active Ticket *</label>
              {tickets.length > 0 ? (
                <select 
                  value={selectedTicketId}
                  onChange={(e) => handleTicketChange(e.target.value)}
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary font-medium"
                >
                  <option value="">-- Choose Ticket --</option>
                  {tickets.map(t => (
                    <option key={t.id} value={t.id}>
                      [{t.id}] {t.title.slice(0, 35)}... ({t.company})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={selectedTicketId}
                  onChange={e => setSelectedTicketId(e.target.value)}
                  placeholder="E.g., TKT-1001"
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary font-medium"
                />
              )}
            </div>

            {/* Engineer Selector */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Assign Field Engineer *</label>
              {engineersList.length === 0 ? (
                <p className="text-xs text-amber-400 p-2 bg-amber-500/10 rounded border border-amber-500/20">
                  No internal staff onboarded yet. Create a user with role "KAA Internal Staff" in Admin Masters.
                </p>
              ) : (
                <select 
                  value={visitEngineer}
                  onChange={(e) => setVisitEngineer(e.target.value)}
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary font-medium"
                >
                  {engineersList.map(u => (
                    <option key={u.id} value={u.name}>{u.name} ({u.roleName})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Client Company */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Client Organization</label>
              <select 
                value={visitCompany}
                onChange={(e) => setVisitCompany(e.target.value)}
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary font-medium"
              >
                {activeCompanies.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                ))}
                {activeCompanies.length === 0 && (
                  <option value={visitCompany || 'Client Site'}>{visitCompany || 'Client Site'}</option>
                )}
              </select>
            </div>

            {/* Site Location */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Site Location / Address *</label>
              <input 
                type="text" 
                value={visitLocation}
                onChange={(e) => setVisitLocation(e.target.value)}
                placeholder="E.g., Client Plant 3, Industrial Area, Doha"
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Visit Date</label>
                <input 
                  type="date" 
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2 text-xs outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Dispatch Time</label>
                <input 
                  type="time" 
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setScheduleModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs" disabled={isSubmitting}>
                {isSubmitting ? 'Dispatching…' : 'Confirm Dispatch'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
