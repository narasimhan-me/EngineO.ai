'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { Logo } from '@/components/ui/logo';
import { Captcha } from '@/components/common/Captcha';

// Sensitive query params that should never appear in URLs
const SENSITIVE_PARAMS = ['password', 'pass', 'pwd', 'confirmPassword', 'email'];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [securityMessage, setSecurityMessage] = useState('');

  // [SECURITY] Client-side defense-in-depth: sanitize URL if sensitive params detected
  useEffect(() => {
    const hasSensitiveParams = SENSITIVE_PARAMS.some((param) =>
      searchParams.has(param)
    );

    if (hasSensitiveParams) {
      router.replace('/signup?sanitized=1');
      setSecurityMessage('For security, we removed sensitive parameters from the URL. Please enter your information.');
      return;
    }

    // Show message if redirected from middleware sanitization
    if (searchParams.get('sanitized') === '1') {
      setSecurityMessage('For security, we removed sensitive parameters from the URL. Please enter your information.');
      // Clean up the sanitized flag from URL
      router.replace('/signup');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Sign up with CAPTCHA token
      await authApi.signup({ email, password, name: name || undefined, captchaToken });

      // Auto login after signup (no CAPTCHA needed for immediate login after signup)
      const loginResponse = await authApi.login({ email, password });
      setToken(loginResponse.accessToken);
      router.push('/projects');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ... imports ...

  // ... inside SignupForm ...

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
          Create your account
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
              <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                Name (optional)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-cockpit/50 border border-border/10 rounded-md shadow-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal/50 transition-all"
                placeholder="John Doe"
              />
            </div>

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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-cockpit/50 border border-border/10 rounded-md shadow-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted-foreground mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-cockpit/50 border border-border/10 rounded-md shadow-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Captcha
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-primary-foreground bg-signal hover:bg-signal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-signal/50 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide transition-colors"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>

        {/* Sign in link */}
        <div className="text-center mt-6 pt-6 border-t border-border/10">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-signal hover:text-signal/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
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
        <SignupForm />
      </Suspense>
    </div>
  );
}
