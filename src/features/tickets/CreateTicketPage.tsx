import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { ArrowLeft, Check, ChevronRight, UploadCloud, Lock, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useMasterStore } from '@/stores/master-store';
import { createTicket } from '@/services/ticketService';
import { Button } from '@/components/ui/button';

const STEPS = ['Context', 'Issue Details', 'Attachments', 'Review & Submit'];

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { isKaaInternal, userCompany } = useAuthStore();
  const { companies, assets, addTicket } = useMasterStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [company, setCompany] = useState('');
  const [assetId, setAssetId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Hardware');

  // Initialize company state once companies are loaded
  useEffect(() => {
    if (!company) {
      if (!isKaaInternal && userCompany) {
        setCompany(userCompany);
      } else if (companies.length > 0) {
        setCompany(companies[0].name);
      }
    }
  }, [companies, isKaaInternal, userCompany, company]);

  // Filter available equipment based on selected company
  const availableAssets = assets.filter(ast => 
    ast.company === company
  );

  const handleNext = async () => {
    if (currentStep === 0 && !company) {
      toast.error('Please select a client company. Onboard a company in Admin Masters first if none exist.');
      return;
    }
    if (currentStep === 1 && !title.trim()) {
      toast.error('Please enter a ticket title');
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      // Submit Ticket to master store & Supabase
      const newTicket = addTicket({
        title: title.trim(),
        description: description.trim() || 'No additional details provided.',
        company: company,
        assetId: assetId,
        priority: priority,
        category: category,
        status: 'open',
        assignee: { name: 'Unassigned', avatar: '' }
      });

      // Background sync with Supabase table
      try {
        await createTicket({
          title: title.trim(),
          description: description.trim(),
          priority: priority,
          category: category,
          company: company,
          assetId: assetId
        });
      } catch (err) {
        console.warn('Supabase sync note:', err);
      }

      toast.success('Ticket created successfully', {
        description: `${newTicket.id} has been generated and logged under ${company}.`
      });

      navigate(`/tickets/${newTicket.id}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
    else navigate('/tickets');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <PageHeader 
        title="Create New Ticket" 
        description={isKaaInternal ? "Submit a new service or support ticket on behalf of a client." : `Raise a new support ticket for ${userCompany || 'your mapped organization'}.`}
      >
        <button onClick={() => navigate('/tickets')} className="p-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </button>
      </PageHeader>

      {/* If no companies exist in master store */}
      {companies.length === 0 && isKaaInternal ? (
        <div className="glass rounded-xl p-12 text-center border border-border flex flex-col items-center justify-center space-y-4">
          <Building2 className="w-12 h-12 text-muted-foreground/40" />
          <h3 className="text-base font-bold text-foreground">No Companies Registered Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Please register your first client company master in Admin Masters before raising a support ticket.
          </p>
          <Link to="/masters">
            <Button size="sm" className="gap-2 text-xs">
              <Building2 className="w-4 h-4" /> Go to Admin Masters
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Stepper */}
          <div className="glass rounded-xl p-6 border-border/50">
            <div className="relative flex justify-between">
              <div className="absolute top-4 left-0 w-full h-0.5 bg-secondary -z-10">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
              {STEPS.map((step, idx) => {
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;
                
                return (
                  <div key={step} className="flex flex-col items-center gap-2 bg-card px-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 shrink-0 z-10 bg-card",
                      isActive ? "border-primary text-primary shadow-lg shadow-primary/30 scale-110" : 
                      isCompleted ? "border-emerald-500 text-emerald-500" : 
                      "border-border text-muted-foreground"
                    )}>
                      {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <span className={cn(
                        "text-xs font-semibold leading-tight",
                        isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="glass rounded-xl p-6 lg:p-8 border-border/50 min-h-[380px]">
            
            {/* Step 1: Context */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-slide-in-right">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h2 className="text-lg font-semibold">Select Organization Context</h2>
                  {!isKaaInternal && (
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Scope Locked to {userCompany}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center justify-between text-foreground">
                      Client Company <span className="text-destructive">*</span>
                      {!isKaaInternal && <Lock className="w-3.5 h-3.5 text-emerald-400" />}
                    </label>
                    <select 
                      value={company}
                      onChange={(e) => {
                        setCompany(e.target.value);
                        setAssetId('');
                      }}
                      disabled={!isKaaInternal}
                      className="w-full bg-card border border-border text-foreground rounded-lg appearance-none cursor-pointer p-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-secondary/50 disabled:text-emerald-400 disabled:font-semibold text-sm"
                      style={{ backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a1a1aa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.7rem top 50%", backgroundSize: "0.65rem auto" }}
                    >
                      {companies.map(c => (
                        <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Mapped Equipment / Asset (Optional)</label>
                    <select 
                      value={assetId}
                      onChange={(e) => setAssetId(e.target.value)}
                      className="w-full bg-card border border-border text-foreground rounded-lg appearance-none cursor-pointer p-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      style={{ backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a1a1aa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.7rem top 50%", backgroundSize: "0.65rem auto" }}
                    >
                      <option value="">{availableAssets.length === 0 ? `No registered assets for ${company} yet (Optional)` : "Select Equipment"}</option>
                      {availableAssets.map((ast: any) => (
                        <option key={ast.id} value={ast.id}>
                          {ast.tag} - {ast.name} ({ast.amcStatus})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Branch / Location</label>
                    <select className="w-full bg-card border border-border text-foreground rounded-lg appearance-none cursor-pointer p-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" style={{ backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a1a1aa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.7rem top 50%", backgroundSize: "0.65rem auto" }}>
                      <option>HQ - Primary Plant</option>
                      <option>Branch Office - Zone 2</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Department</label>
                    <select className="w-full bg-card border border-border text-foreground rounded-lg appearance-none cursor-pointer p-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" style={{ backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a1a1aa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.7rem top 50%", backgroundSize: "0.65rem auto" }}>
                      <option>IT & Infrastructure</option>
                      <option>Plant Maintenance</option>
                      <option>Operations</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Issue Details */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-slide-in-right">
                <h2 className="text-lg font-semibold border-b border-border pb-3">Issue Category & Details</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Subject / Title <span className="text-destructive">*</span></label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter detailed issue summary..." 
                      className="w-full bg-background border border-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-card border border-border text-foreground rounded-lg appearance-none cursor-pointer p-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" style={{ backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a1a1aa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.7rem top 50%", backgroundSize: "0.65rem auto" }}>
                        <option value="Hardware">Hardware / Machinery</option>
                        <option value="Software">Software / Firmware</option>
                        <option value="Electrical">Electrical / PLC</option>
                        <option value="Network">Network / Cloud</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Priority Level</label>
                      <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-card border border-border text-foreground rounded-lg appearance-none cursor-pointer p-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" style={{ backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a1a1aa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.7rem top 50%", backgroundSize: "0.65rem auto" }}>
                        <option value="low">Low (Standard response)</option>
                        <option value="medium">Medium (4-hour SLA)</option>
                        <option value="high">High (2-hour SLA)</option>
                        <option value="critical">Critical (Emergency dispatch)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Detailed Symptom Description</label>
                    <textarea 
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe error codes, physical condition, LED status, or steps to reproduce..."
                      className="w-full bg-background border border-border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Attachments */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-slide-in-right">
                <h2 className="text-lg font-semibold border-b border-border pb-3">Supporting Attachments & Photos</h2>
                
                <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center transition-colors cursor-pointer space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Click to upload or drag & drop files</p>
                    <p className="text-xs text-muted-foreground mt-1">Images, PDF logs, diagnostics XML up to 25MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-slide-in-right">
                <h2 className="text-lg font-semibold border-b border-border pb-3">Review & Submit Ticket</h2>
                
                <div className="bg-secondary/30 rounded-xl p-5 border border-border space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground text-xs block">COMPANY</span>
                      <span className="font-semibold text-primary">{company}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block">PRIORITY</span>
                      <span className="font-semibold capitalize text-amber-400">{priority}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block">TITLE</span>
                      <span className="font-medium text-foreground">{title}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block">CATEGORY</span>
                      <span className="font-medium text-foreground">{category}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors text-foreground"
            >
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </button>

            <button
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              {currentStep === STEPS.length - 1 ? 'Submit Ticket' : 'Next Step'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
