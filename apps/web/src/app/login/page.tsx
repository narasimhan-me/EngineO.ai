'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi, ApiError } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { Logo } from '@/components/ui/logo';

// Lazy load Captcha to avoid loading Turnstile script until needed
const Captcha = lazy(() =>
  import('@/components/common/Captcha').then((m) => ({ default: m.Captcha }))
);

// Session storage key for 2FA temp token
const TEMP_2FA_TOKEN_KEY = 'engineo_temp_2fa_token';

// Sensitive query params that should never appear in URLs
const SENSITIVE_PARAMS = ['password', 'pass', 'pwd', 'email'];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [securityMessage, setSecurityMessage] = useState('');

  // [SECURITY] Client-side defense-in-depth: sanitize URL if sensitive params detected
  useEffect(() => {
    const hasSensitiveParams = SENSITIVE_PARAMS.some((param) =>
      searchParams.has(param)
    );

    if (hasSensitiveParams) {
      // Build sanitized URL preserving only `next` param
      const nextParam = searchParams.get('next');
      const sanitizedUrl = nextParam ? `/login?next=${encodeURIComponent(nextParam)}&sanitized=1` : '/login?sanitized=1';
      router.replace(sanitizedUrl);
      setSecurityMessage('For security, we removed sensitive parameters from the URL. Please enter your credentials.');
      return;
    }

    // Show message if redirected from middleware sanitization
    if (searchParams.get('sanitized') === '1') {
      setSecurityMessage('For security, we removed sensitive parameters from the URL. Please enter your credentials.');
      // Clean up the sanitized flag from URL
      const nextParam = searchParams.get('next');
      const cleanUrl = nextParam ? `/login?next=${encodeURIComponent(nextParam)}` : '/login';
      router.replace(cleanUrl);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // If CAPTCHA is showing, require it
    if (showCaptcha && !captchaToken) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({
        email,
        password,
        captchaToken: captchaToken || undefined,
      });

      // Check if 2FA is required
      if (response.requires2FA && response.tempToken) {
        // Store temp token in sessionStorage (cleared when tab closes)
        sessionStorage.setItem(TEMP_2FA_TOKEN_KEY, response.tempToken);
        // Redirect to 2FA verification page
        router.push('/2fa');
        return;
      }

      // Normal login (no 2FA)
      setToken(response.accessToken);
      router.push('/projects');
    } catch (err: unknown) {
      // Check if CAPTCHA is now required due to failed attempts
      if (err instanceof ApiError && err.code === 'CAPTCHA_REQUIRED') {
        setShowCaptcha(true);
        setCaptchaToken(null);
      }
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };


  // ... imports remain the same ...

  // ... inside LoginForm ...

  return (
    <div className="max-w-md w-full">
      {/* [DEO-UX-REFRESH-1] Premium branded header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Logo withText={true} className="scale-125" />
        </div>
        <p className="text-sm text-muted-foreground">
          Digital Engine Optimization for AI-Powered Discovery
        </p>
      </div>

      {/* [DEO-UX-REFRESH-1] Premium card styling */}
      <div className="bg-card rounded-xl border border-border/10 shadow-2xl shadow-black/50 p-8 backdrop-blur-sm">
        {/* Accessible heading */}
        <h1 className="text-2xl font-semibold text-foreground text-center mb-6">
          Sign in
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {securityMessage && (
            <div className="bg-amber-900/20 border border-amber-900/50 text-amber-200 px-4 py-3 rounded text-sm">
              {securityMessage}
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-cockpit/50 border border-border/10 rounded-md shadow-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal/50 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-cockpit/50 border border-border/10 rounded-md shadow-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {showCaptcha && (
            <div className="flex justify-center">
              <Suspense fallback={<div className="text-sm text-muted-foreground">Loading CAPTCHA...</div>}>
                <Captcha
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setCaptchaToken(null)}
                />
              </Suspense>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || (showCaptcha && !captchaToken)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-primary-foreground bg-signal hover:bg-signal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-signal/50 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        {/* Sign up link */}
        <div className="text-center mt-6 pt-6 border-t border-border/10">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-signal hover:text-signal/80 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cockpit/30 to-background">
      <Suspense fallback={
        <div className="max-w-md w-full text-center">
          <div className="animate-pulse">
            <div className="h-10 bg-cockpit rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-cockpit rounded w-64 mx-auto"></div>
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
