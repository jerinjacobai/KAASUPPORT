import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { ArrowLeft, Check, ChevronRight, UploadCloud, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { mockAssets } from '@/lib/mock-data';

const STEPS = ['Context', 'Issue Details', 'Attachments', 'Review'];

export default function CreateTicketPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { isKaaInternal, userCompany } = useAuthStore();

  const [company, setCompany] = useState(isKaaInternal ? '' : (userCompany || 'Acme Corp'));
  const [assetId, setAssetId] = useState('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Hardware');

  // Filter assets to mapped company if client login
  const availableAssets = mockAssets.filter(ast => 
    isKaaInternal ? true : (company ? ast.company === company : true)
  );

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      // Submit
      toast.success('Ticket created successfully', {
        description: 'TKT-1064 has been generated and assigned.'
      });
      navigate('/tickets/TKT-1064');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
    else navigate('/tickets');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <PageHeader 
        title="Create New Ticket" 
        description={isKaaInternal ? "Submit a new service or support ticket on behalf of a client." : `Raise a new support ticket for ${userCompany || 'your mapped organization'}.`}
      >
        <button onClick={() => navigate('/tickets')} className="p-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </button>
      </PageHeader>

      {/* Stepper */}
      <div className="glass rounded-xl p-4 border-border/50">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-secondary -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-300 -z-10"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          ></div>
          
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            
            return (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors border-2",
                  isActive ? "bg-background border-primary text-primary shadow-lg shadow-primary/20" : 
                  isCompleted ? "bg-primary border-primary text-primary-foreground" : 
                  "bg-background border-border text-muted-foreground"
                )}>
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={cn(
                  "text-xs font-medium absolute top-10 whitespace-nowrap",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="glass rounded-xl p-6 lg:p-8 border-border/50 mt-12 min-h-[400px]">
        
        {/* Step 1: Context */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-xl font-semibold">Select Organization Context</h2>
              {!isKaaInternal && (
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Scope Locked to {userCompany}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center justify-between">
                  Company <span className="text-destructive">*</span>
                  {!isKaaInternal && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                </label>
                <select 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={!isKaaInternal}
                  className="w-full bg-background border border-border focus:border-primary rounded-lg p-2.5 text-sm outline-none disabled:opacity-75"
                >
                  <option value="Acme Corp">Acme Corp</option>
                  <option value="Globex Ltd">Globex Ltd</option>
                  <option value="Initech Inc">Initech Inc</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mapped Equipment / Asset (Optional)</label>
                <select 
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full bg-background border border-border focus:border-primary rounded-lg p-2.5 text-sm outline-none"
                >
                  <option value="">Select Equipment</option>
                  {availableAssets.map(ast => (
                    <option key={ast.id} value={ast.id}>
                      {ast.tag} - {ast.name} ({ast.amcStatus})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Branch / Location</label>
                <select className="w-full bg-background border border-border focus:border-primary rounded-lg p-2.5 text-sm outline-none">
                  <option>HQ - Primary Plant</option>
                  <option>Branch Office - Zone 2</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <select className="w-full bg-background border border-border focus:border-primary rounded-lg p-2.5 text-sm outline-none">
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
            <h2 className="text-xl font-semibold mb-6">Issue Category & Details</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject / Title <span className="text-destructive">*</span></label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Siemens PLC input module failure on line 3" 
                  className="w-full bg-background border border-border focus:border-primary rounded-lg p-2.5 text-sm outline-none" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-background border border-border focus:border-primary rounded-lg p-2.5 text-sm outline-none">
                    <option>Hardware</option>
                    <option>Electrical</option>
                    <option>PLC</option>
                    <option>Software / ERP</option>
                    <option>Biometric</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority Level</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-background border border-border focus:border-primary rounded-lg p-2.5 text-sm outline-none">
                    <option value="low">Low (Standard SLA)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical (Immediate SLA Alert)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Problem Description</label>
                <textarea rows={4} placeholder="Describe the error code, machine symptoms, or breakdown in detail..." className="w-full bg-background border border-border focus:border-primary rounded-lg p-2.5 text-sm outline-none resize-none"></textarea>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Attachments */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-slide-in-right">
            <h2 className="text-xl font-semibold mb-6">Upload Photos & Documents</h2>
            
            <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center bg-secondary/20 transition-all cursor-pointer">
              <UploadCloud className="w-10 h-10 text-primary mx-auto mb-3" />
              <p className="font-medium text-sm">Drag and drop photos of error logs or equipment here</p>
              <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, PDF, ZIP up to 25MB</p>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-slide-in-right">
            <h2 className="text-xl font-semibold mb-4">Review Ticket Before Submission</h2>
            
            <div className="bg-secondary/30 p-4 rounded-xl border border-border space-y-3 text-sm">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Mapped Client:</span>
                <span className="font-semibold text-foreground">{company}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Title:</span>
                <span className="font-medium text-foreground">{title || 'Equipment Issue'}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Priority:</span>
                <span className="font-semibold uppercase text-primary">{priority}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-border mt-8">
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            {currentStep === STEPS.length - 1 ? 'Submit Ticket' : 'Continue'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
