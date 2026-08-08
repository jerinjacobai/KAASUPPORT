import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { ArrowLeft, Check, ChevronRight, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STEPS = ['Context', 'Issue Details', 'Attachments', 'Review'];

export default function CreateTicketPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

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
        description="Follow the steps to submit a new service or support request."
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
            <h2 className="text-xl font-semibold mb-6">Select Organization Context</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company <span className="text-destructive">*</span></label>
                <select className="w-full bg-background border border-border focus:border-primary rounded-lg p-2.5 outline-none">
                  <option value="">Select Company</option>
                  <option>Acme Corp</option>
                  <option>Globex</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <select className="w-full bg-background border border-border focus:border-primary rounded-lg p-2.5 outline-none" disabled>
                  <option>Select Company First</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Branch / Location</label>
                <select className="w-full bg-background border border-border focus:border-primary rounded-lg p-2.5 outline-none">
                  <option>HQ - New York</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Related Asset (Optional)</label>
                <input type="text" placeholder="Search by Asset ID..." className="w-full bg-background border border-border focus:border-primary rounded-lg p-2.5 outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Issue Details */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-slide-in-right">
            <h2 className="text-xl font-semibold mb-6">Issue Details</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority <span className="text-destructive">*</span></label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                    <label key={p} className="relative flex cursor-pointer rounded-lg border bg-background p-3 hover:bg-secondary/50 transition-colors focus-within:ring-2 focus-within:ring-primary border-border">
                      <input type="radio" name="priority" className="sr-only" />
                      <span className="text-sm font-medium text-center w-full">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
                <input type="text" placeholder="Brief summary of the issue" className="w-full bg-background border border-border focus:border-primary rounded-lg p-2.5 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description <span className="text-destructive">*</span></label>
                <textarea rows={6} placeholder="Provide detailed information about the issue, steps to reproduce, etc." className="w-full bg-background border border-border focus:border-primary rounded-lg p-3 outline-none resize-none"></textarea>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Attachments */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-slide-in-right">
            <h2 className="text-xl font-semibold mb-6">Attachments & Contact</h2>
            
            <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-10 flex flex-col items-center justify-center text-center bg-secondary/20 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">SVG, PNG, JPG, PDF or LOG files (max 10MB)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Person</label>
                <input type="text" placeholder="Name" className="w-full bg-background border border-border focus:border-primary rounded-lg p-2.5 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Phone</label>
                <input type="text" placeholder="+1 (555) 000-0000" className="w-full bg-background border border-border focus:border-primary rounded-lg p-2.5 outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Review & Submit</h2>
            </div>
            
            <div className="bg-secondary/30 rounded-lg p-6 border border-border space-y-6">
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="text-muted-foreground">Company:</div>
                <div className="font-medium">Acme Corp</div>
                
                <div className="text-muted-foreground">Priority:</div>
                <div className="font-medium text-amber-500">Medium</div>
                
                <div className="text-muted-foreground">Title:</div>
                <div className="font-medium">Software installation failing on POS register</div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="text-muted-foreground text-sm mb-2">Description:</div>
                <p className="text-sm bg-background p-4 rounded border border-border">When trying to update the POS software to v2.4, it errors out with code E-505. Needs immediate attention as the terminal is down.</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-6">
        <button 
          onClick={handleBack}
          className="px-5 py-2.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-lg font-medium transition-colors"
        >
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </button>
        
        <button 
          onClick={handleNext}
          className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/25"
        >
          {currentStep === STEPS.length - 1 ? 'Submit Ticket' : 'Continue'}
          {currentStep !== STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
