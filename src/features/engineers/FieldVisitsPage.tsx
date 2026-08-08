import { PageHeader } from '@/components/shared/PageHeader';
import { mockFieldVisits } from '@/lib/mock-data';
import { MapPin, Navigation, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function FieldVisitsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Visits & Schedule"
        description="Real-time engineer location tracking, dispatch schedule, and GPS check-ins"
      >
        <Button variant="default" className="gap-2">
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
              <div key={visit.id} className="glass rounded-xl p-5 border border-border hover:border-primary/40 transition-all space-y-4">
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

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs">
                    {visit.GPSConfirmed ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> GPS Checked In ({visit.checkInTime})
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Pending Check In
                      </span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <Navigation className="w-3 h-3" /> Track Location
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Engineer Map Placeholder */}
        <div className="glass rounded-xl p-6 border border-border flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-pulse">
            <Navigation className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Live Engineer Geo Map</h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              Real-time GPS tracking enabled for 4 active field engineers across regional hubs.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Google Maps API Integrated
          </Badge>
        </div>
      </div>
    </div>
  );
}
