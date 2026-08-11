import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast.error('Authentication failed', {
          description: error.message || 'Invalid email or password.'
        });
        return;
      }
      toast.success('Signed in successfully', {
        description: `Welcome back to KAA Support Portal.`
      });
      navigate('/dashboard');
    } catch {
      toast.error('Sign in error', {
        description: 'Unable to connect to authentication service.'
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/30 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[100px]" />
      </div>

      <div className="w-full max-w-md z-10 p-4 animate-slide-in-up">
        <div className="glass rounded-2xl p-8 shadow-2xl border border-border">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-primary to-violet-600 flex items-center justify-center shadow-xl shadow-primary/30 mb-4 border border-white/10">
              <span className="text-3xl font-extrabold text-white leading-none">K</span>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 tracking-tight">
              KAA SUPPORT PORTAL
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
              Enterprise Multi-Tenant Support & Service Operations Management
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold px-1 text-foreground">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  autoComplete="email"
                  {...register('email')}
                  className="w-full bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all outline-none text-foreground placeholder:text-muted-foreground"
                  placeholder="admin@kaasupport.com"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive px-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-foreground">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  autoComplete="current-password"
                  {...register('password')}
                  className="w-full bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl py-2.5 pl-10 pr-10 text-sm transition-all outline-none text-foreground placeholder:text-muted-foreground"
                  placeholder="••••••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive px-1">{errors.password.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-6 bg-gradient-to-r from-indigo-500 via-primary to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2 text-sm disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Support Portal <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/50 text-center">
            <span className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Supabase Authentication & RLS Active
            </span>
          </div>

        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} KAA Support Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
}
