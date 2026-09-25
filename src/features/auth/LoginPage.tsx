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
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background bg-[radial-gradient(ellipse_at_top,rgba(124,131,255,0.11),transparent_48%)]">

      <div className="w-full max-w-md z-10 p-4 animate-slide-in-up">
        <div className="rounded-2xl p-8 sm:p-9 bg-card border border-border shadow-2xl shadow-black/15">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
              <span className="text-2xl font-bold text-primary-foreground leading-none">K</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
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
                  className="w-full bg-background border border-input focus:border-primary/70 focus:ring-2 focus:ring-primary/15 rounded-lg py-2.5 pl-10 pr-4 text-sm transition-all outline-none text-foreground placeholder:text-muted-foreground"
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
                  className="w-full bg-background border border-input focus:border-primary/70 focus:ring-2 focus:ring-primary/15 rounded-lg py-2.5 pl-10 pr-10 text-sm transition-all outline-none text-foreground placeholder:text-muted-foreground"
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
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors shadow-md shadow-primary/15 flex items-center justify-center gap-2 text-sm disabled:opacity-70"
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
