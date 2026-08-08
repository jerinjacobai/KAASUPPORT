import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Building2, User } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'admin' | 'client'>('admin');
  const [selectedCompany, setSelectedCompany] = useState('Acme Corp');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn, loginAsAdmin, loginAsClient } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: loginType === 'admin' ? 'admin@kaa-erp.com' : 'john.doe@acmecorp.com',
      password: 'password123',
      rememberMe: false
    }
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    try {
      await signIn(data.email, data.password, loginType === 'client', selectedCompany);
      toast.success(`Logged in as ${loginType === 'admin' ? 'KAA Admin' : `Client User (${selectedCompany})`}`);
      navigate('/dashboard');
    } catch {
      toast.error('Invalid credentials');
    }
  };

  const handleQuickAdmin = () => {
    loginAsAdmin();
    toast.success('Signed in as KAA Super Admin');
    navigate('/dashboard');
  };

  const handleQuickClient = (company: string) => {
    loginAsClient(company);
    toast.success(`Signed in as Client User (${company})`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/30 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[100px]" />
      </div>

      <div className="w-full max-w-md z-10 p-4 animate-slide-in-up">
        <div className="glass rounded-2xl p-8 shadow-2xl border-border/50">
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-primary/30 mb-3">
              <span className="text-2xl font-bold text-white leading-none">K</span>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              KAA Support Portal
            </h1>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Enterprise Support & Multi-Tenant Field Service Management
            </p>
          </div>

          {/* Dual Login Type Selector */}
          <div className="grid grid-cols-2 gap-2 bg-secondary/50 p-1 rounded-xl mb-6 border border-border">
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                loginType === 'admin'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin / Staff
            </button>

            <button
              type="button"
              onClick={() => setLoginType('client')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                loginType === 'client'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Client Portal
            </button>
          </div>

          {/* Client Company Selection Dropdown if Client mode */}
          {loginType === 'client' && (
            <div className="mb-4 space-y-1.5 animate-fade-in">
              <label className="text-xs font-medium text-muted-foreground">Select Client Company</label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full bg-secondary/60 border border-border rounded-lg p-2.5 text-xs text-foreground font-medium outline-none focus:border-primary"
              >
                <option value="Acme Corp">Acme Corp (Client Account #1)</option>
                <option value="Globex Ltd">Globex Ltd (Client Account #2)</option>
                <option value="Initech Inc">Initech Inc (Client Account #3)</option>
              </select>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium px-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  {...register('email')}
                  className="w-full bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-10 pr-4 text-sm transition-all outline-none"
                  placeholder={loginType === 'admin' ? "admin@kaa-erp.com" : "client.user@company.com"}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive px-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-medium">Password</label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  {...register('password')}
                  className="w-full bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-10 pr-10 text-sm transition-all outline-none"
                  placeholder="Enter password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive px-1">{errors.password.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2 text-sm disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In as {loginType === 'admin' ? 'KAA Admin' : 'Client User'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-4 border-t border-border/60 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase text-center tracking-wider">
              ⚡ Quick Demo Shortcuts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleQuickAdmin}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> KAA Admin Mode
              </button>
              
              <button
                onClick={() => handleQuickClient('Acme Corp')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-all"
              >
                <User className="w-3.5 h-3.5 shrink-0" /> Client: Acme Corp
              </button>
            </div>
          </div>

        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-6">
          Multi-tenant Row-Level Security (RLS) active. Clients only see mapped assets & tickets.
        </p>
      </div>
    </div>
  );
}
