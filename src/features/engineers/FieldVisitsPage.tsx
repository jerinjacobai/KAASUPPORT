import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockFieldVisits } from '@/lib/mock-data';
import { MapPin, Navigation, Calendar, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ServiceReportModal } from '@/features/engineers/ServiceReportModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function FieldVisitsPage() {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [visitEngineer, setVisitEngineer] = useState('Alex Johnson');
  const [visitLocation, setVisitLocation] = useState('Acme Corp Plant 3, Bangalore');

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
    toast.success('Field Visit Scheduled', {
      description: `Dispatched ${visitEngineer} to ${visitLocation}.`
    });
    setScheduleModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Visits & Schedule"
        description="Real-time engineer location tracking, dispatch schedule, and GPS check-ins"
      >
        <Button variant="default" onClick={() => setScheduleModalOpen(true)} className="gap-2">
          <Navigation className="w-4 h-4" /> Schedule Field Visit
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
            <h3 className="font-semibold text-base">Today's Visits ({mockFieldVisits.length})</h3>
            <span className="text-xs text-muted-foreground">Live GPS Sync Active</span>
          </div>

          <div className="space-y-4">
            {mockFieldVisits.map((visit) => (
              <div key={visit.id} className="glass rounded-xl p-5 border border-border hover:border-primary/40 transition-all space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <img src={visit.engineerAvatar} alt={visit.engineerName} className="w-10 h-10 rounded-full border border-primary/30 object-cover" />
                    <div>
                      <h4 className="font-semibold text-sm">{visit.engineerName}</h4>
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
        </div>

        {/* Live Engineer Map Widget */}
        <div className="glass rounded-xl p-6 border border-border flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-pulse border border-primary/20">
            <Navigation className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Live Engineer Geo Map</h3>
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
        <DialogContent className="max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Schedule New Field Visit</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Dispatch a field service engineer for on-site maintenance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Assign Engineer</label>
              <select 
                value={visitEngineer}
                onChange={(e) => setVisitEngineer(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              >
                <option value="Alex Johnson">Alex Johnson (Senior PLC Specialist)</option>
                <option value="Priya Sharma">Priya Sharma (Hardware Engineer)</option>
                <option value="David Chen">David Chen (Network Field Tech)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Site Location / Address</label>
              <input 
                type="text" 
                value={visitLocation}
                onChange={(e) => setVisitLocation(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs outline-none focus:border-primary"
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
