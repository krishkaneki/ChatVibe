'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { loginSchema, registerSchema, LoginInput, RegisterInput } from '@/lib/validations';

// ─── Left decorative panel ────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <section
      className="hidden md:flex md:w-[45%] lg:w-1/2 relative flex-col justify-center items-center overflow-hidden shrink-0"
      style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #6C63FF 100%)' }}
    >
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-[120px]"
        style={{ background: 'rgba(168,164,255,0.2)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full blur-[120px]"
        style={{ background: 'rgba(69,68,93,0.3)' }} />

      {/* Bubble 1 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="absolute top-[10%] left-[5%] glass-card p-4 rounded-2xl w-52 flex items-center gap-3 shadow-xl -rotate-12 z-10"
      >
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">👤</div>
        <div className="flex-1 space-y-1.5">
          <div className="h-2 w-16 bg-white/20 rounded-full" />
          <div className="h-2 w-24 bg-white/10 rounded-full" />
        </div>
      </motion.div>

      {/* Bubble 2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="absolute top-[22%] right-[6%] p-4 rounded-2xl w-60 flex items-center gap-3 shadow-xl rotate-6 z-10"
        style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
      >
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">💬</div>
        <div className="flex-1 space-y-1.5">
          <div className="h-2 w-20 bg-white/40 rounded-full" />
          <div className="h-2 w-32 bg-white/20 rounded-full" />
        </div>
      </motion.div>

      {/* Branding */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
        className="relative z-20 text-center"
      >
        <h1 className="font-headline font-extrabold text-6xl tracking-tighter text-white mb-3">ChatVibe</h1>
        <p className="font-headline text-xl text-white/80 font-medium">Connect. Chat. Vibe.</p>
      </motion.div>

      {/* Bubble 3 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="absolute bottom-[12%] left-[6%] glass-card p-4 rounded-2xl w-52 flex items-center gap-3 shadow-xl -rotate-3 z-10"
      >
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">❤️</div>
        <div className="flex-1 space-y-1.5">
          <div className="h-2 w-14 bg-white/20 rounded-full" />
          <div className="h-2 w-20 bg-white/10 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

// ─── Social buttons ───────────────────────────────────────────────────────────
function SocialButtons() {
  return (
    <>
      <div className="relative flex items-center my-5">
        <div className="flex-grow border-t border-surface-variant" />
        <span className="flex-shrink mx-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          Or continue with
        </span>
        <div className="flex-grow border-t border-surface-variant" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button"
          onClick={() => signIn('google', { callbackUrl: '/chat' })}
          className="flex items-center justify-center gap-2 py-3 bg-surface-container-low hover:bg-surface-container-high rounded-2xl transition-all">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-sm font-semibold text-on-surface">Google</span>
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button"
          onClick={() => signIn('github', { callbackUrl: '/chat' })}
          className="flex items-center justify-center gap-2 py-3 bg-surface-container-low hover:bg-surface-container-high rounded-2xl transition-all">
          <svg className="w-5 h-5 text-on-surface" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          <span className="text-sm font-semibold text-on-surface">GitHub</span>
        </motion.button>
      </div>
    </>
  );
}

// ─── Reusable input field ─────────────────────────────────────────────────────
function Field({ label, icon: Icon, error, children }: {
  label: string; icon: React.ElementType; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">
        {label}
      </label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors z-10" />
        {children}
      </div>
      {error && <p className="text-error text-xs ml-1">{error}</p>}
    </div>
  );
}

// ─── Tab toggle ───────────────────────────────────────────────────────────────
function TabToggle({ active }: { active: 'signin' | 'signup' }) {
  return (
    <div className="bg-surface-container-high p-1 rounded-xl flex mb-5">
      <Link href="/login"
        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg text-center transition-all ${
          active === 'signin'
            ? 'bg-surface-container-highest text-primary shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}>
        Sign In
      </Link>
      <Link href="/register"
        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg text-center transition-all ${
          active === 'signup'
            ? 'bg-surface-container-highest text-primary shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}>
        Sign Up
      </Link>
    </div>
  );
}

// ─── RIGHT PANEL — shared scrollable container ───────────────────────────────
function RightPanel({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full md:w-[55%] lg:w-1/2 bg-surface flex flex-col overflow-y-auto">
      {/* Mobile branding */}
      <div className="md:hidden text-center pt-8 pb-4 px-6">
        <h1 className="font-headline font-extrabold text-4xl text-gradient">ChatVibe</h1>
        <p className="text-on-surface-variant text-sm mt-1">Connect. Chat. Vibe.</p>
      </div>

      {/* Main form content */}
      <div className="flex-1 flex items-start md:items-center justify-center px-6 sm:px-10 lg:px-14 py-6 md:py-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-4 text-on-surface-variant/30 text-[10px] uppercase tracking-widest font-bold">
        Powered by VibeOS
      </div>
    </section>
  );
}

// ─── SIGN IN ──────────────────────────────────────────────────────────────────
export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email, password: data.password, redirect: false,
      });
      if (result?.error) toast.error('Invalid email or password');
      else { router.push('/chat'); router.refresh(); }
    } catch { toast.error('Something went wrong'); }
    finally { setIsLoading(false); }
  };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-surface">
      <LeftPanel />
      <RightPanel>
        <div className="mb-6">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Welcome back</h2>
          <p className="text-on-surface-variant text-sm mt-1">Sign in to stay connected with your vibe tribe.</p>
        </div>

        <TabToggle active="signin" />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Email Address" icon={Mail} error={errors.email?.message}>
              <input {...register('email')} type="email" placeholder="name@vibe.com"
                className="w-full bg-surface-container-low rounded-2xl py-4 pl-11 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:bg-surface-variant transition-all outline-none border-none" />
            </Field>

            {/* Password with forgot link */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Password</span>
                <a href="#" className="text-xs font-semibold text-primary hover:text-primary-dim transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors z-10" />
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  className="w-full bg-surface-container-low rounded-2xl py-4 pl-11 pr-12 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:bg-surface-variant transition-all outline-none border-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-error text-xs ml-1">{errors.password.message}</p>}
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading}
              className="w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </form>

          <SocialButtons />

          <p className="text-center text-sm text-on-surface-variant mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-primary hover:text-primary-dim transition-colors">
              Create account
            </Link>
          </p>
        </motion.div>
      </RightPanel>
    </main>
  );
}

// ─── SIGN UP ──────────────────────────────────────────────────────────────────
export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      await axios.post('/api/auth/register', {
        name: data.name, email: data.email, password: data.password,
      });
      const result = await signIn('credentials', {
        email: data.email, password: data.password, redirect: false,
      });
      if (result?.error) toast.error('Login failed after registration');
      else { toast.success('Welcome to ChatVibe! 🎉'); router.push('/chat'); }
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        || 'Registration failed';
      toast.error(msg);
    } finally { setIsLoading(false); }
  };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-surface">
      <LeftPanel />
      <RightPanel>
        <div className="mb-5">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Create account</h2>
          <p className="text-on-surface-variant text-sm mt-1">Join the vibe tribe today.</p>
        </div>

        <TabToggle active="signup" />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Field label="Full Name" icon={User} error={errors.name?.message}>
              <input {...register('name')} type="text" placeholder="Your name"
                className="w-full bg-surface-container-low rounded-2xl py-3.5 pl-11 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:bg-surface-variant transition-all outline-none border-none" />
            </Field>

            <Field label="Email Address" icon={Mail} error={errors.email?.message}>
              <input {...register('email')} type="email" placeholder="name@vibe.com"
                className="w-full bg-surface-container-low rounded-2xl py-3.5 pl-11 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:bg-surface-variant transition-all outline-none border-none" />
            </Field>

            <Field label="Password" icon={Lock} error={errors.password?.message}>
              <>
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  className="w-full bg-surface-container-low rounded-2xl py-3.5 pl-11 pr-12 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:bg-surface-variant transition-all outline-none border-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </>
            </Field>

            <Field label="Confirm Password" icon={Lock} error={errors.confirmPassword?.message}>
              <input {...register('confirmPassword')} type="password" placeholder="••••••••"
                className="w-full bg-surface-container-low rounded-2xl py-3.5 pl-11 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:bg-surface-variant transition-all outline-none border-none" />
            </Field>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading}
              className="w-full text-white font-bold py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </form>

          <SocialButtons />

          <p className="text-center text-sm text-on-surface-variant mt-3">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-primary hover:text-primary-dim transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </RightPanel>
    </main>
  );
}

export default LoginForm;
