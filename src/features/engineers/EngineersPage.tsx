import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockEngineers } from '@/lib/mock-data';
import { UserCheck, MapPin, Star, Wrench, Mail, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function EngineersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEngineers = mockEngineers.filter(eng =>
    eng.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eng.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eng.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Engineers Directory"
        description="Manage field engineers, skill sets, availability and location tracking"
      >
        <Button variant="default" className="gap-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredEngineers.map((engineer) => (
          <div key={engineer.id} className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all group flex flex-col justify-between">
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
                  {engineer.skills.map((skill, idx) => (
                    <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-secondary border border-border text-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-2">
              <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                <Mail className="w-3.5 h-3.5" /> Message
              </Button>
              <Button variant="default" size="sm" className="w-full text-xs gap-1">
                <Wrench className="w-3.5 h-3.5" /> Assign Ticket
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
