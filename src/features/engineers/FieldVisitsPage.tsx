import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { MapPin, Navigation, Calendar, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ServiceReportModal } from '@/features/engineers/ServiceReportModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMasterStore } from '@/stores/master-store';

export default function FieldVisitsPage() {
  const { users } = useMasterStore();
  const engineersList = users.filter(u => u.roleType === 'KAA Internal Staff');

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [visitsList, setVisitsList] = useState<any[]>([]);

  const [visitEngineer, setVisitEngineer] = useState(engineersList[0]?.name || '');
  const [visitLocation, setVisitLocation] = useState('');

  const handleOpenReport = (visit: any) => {
    setSelectedVisit(visit);
    setReportModalOpen(true);
  };

  const handleTrackLocation = (engineerName: string, location: string) => {
    toast.info(`Live GPS Tracking: ${engineerName}`, {
      description: `Current Position: ${location} (Accuracy: ±5m)`
    });
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitEngineer || !visitLocation.trim()) {
      toast.error('Please select an engineer and enter location');
      return;
    }

    const newVisit = {
      id: `VISIT-${visitsList.length + 1}`,
      ticketId: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      engineerName: visitEngineer,
      engineerAvatar: '',
      companyName: 'Client Site',
      location: visitLocation,
      scheduledStart: 'Today, 02:00 PM',
      status: 'En Route',
      GPSConfirmed: true,
      checkInTime: '01:55 PM'
    };

    setVisitsList([newVisit, ...visitsList]);
    toast.success('Field Visit Scheduled', {
      description: `Dispatched ${visitEngineer} to ${visitLocation}.`
    });
    setScheduleModalOpen(false);
    setVisitLocation('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Visits & Schedule"
        description="Real-time engineer location tracking, dispatch schedule, and GPS check-ins"
      >
        <Button variant="default" onClick={() => setScheduleModalOpen(true)} className="gap-2 text-xs">
          <Navigation className="w-4 h-4" /> Schedule Field Visit
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
            <h3 className="font-semibold text-base text-foreground">Scheduled Visits ({visitsList.length})</h3>
            <span className="text-xs text-muted-foreground">Live GPS Sync Active</span>
          </div>

          {visitsList.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center border border-border flex flex-col items-center justify-center">
              <Navigation className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <h3 className="text-base font-bold text-foreground">No Field Visits Scheduled</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">Click "Schedule Field Visit" above to dispatch engineers to client locations.</p>
              <Button onClick={() => setScheduleModalOpen(true)} size="sm" className="mt-4 gap-2 text-xs">
                <Navigation className="w-4 h-4" /> Schedule Field Visit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {visitsList.map((visit) => (
                <div key={visit.id} className="glass rounded-xl p-5 border border-border hover:border-primary/40 transition-all space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold text-sm flex items-center justify-center shrink-0">
                        {visit.engineerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{visit.engineerName}</h4>
                        <p className="text-xs text-muted-foreground">Ticket: <span className="font-medium text-primary">{visit.ticketId}</span> ({visit.companyName})</p>
                      </div>
                    </div>
                    <Badge variant={visit.status === 'Arrived On Site' ? 'success' : 'warning'}>
                      {visit.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span>{visit.location}</span>
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
                          <CheckCircle2 className="w-3.5 h-3.5" /> GPS Checked In ({visit.checkInTime})
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" /> Pending Check In
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
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
                        <FileText className="w-3 h-3" /> PDF Report
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
            <DialogTitle className="text-base font-bold">Schedule New Field Visit</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Dispatch a field service engineer for on-site maintenance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Assign Engineer</label>
              {engineersList.length === 0 ? (
                <p className="text-xs text-amber-400 p-2 bg-amber-500/10 rounded border border-amber-500/20">
                  No internal staff engineers onboarded yet. Create a user in Admin Masters with role "KAA Internal Staff".
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

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Site Location / Address *</label>
              <input 
                type="text" 
                value={visitLocation}
                onChange={(e) => setVisitLocation(e.target.value)}
                placeholder="E.g., Client Plant 3, Bangalore"
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setScheduleModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs">
                Confirm Dispatch
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
