'use client';

import { GuardedLink } from '@/components/navigation/GuardedLink';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { isAuthenticated, removeToken } from '@/lib/auth';
import { usersApi } from '@/lib/api';
import { useEffect, useState, useRef } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  adminRole?: 'SUPPORT_AGENT' | 'OPS_ADMIN' | 'MANAGEMENT_CEO' | null;
  // [SELF-SERVICE-1] Account role for customer permissions
  accountRole?: 'OWNER' | 'EDITOR' | 'VIEWER';
}

export default function TopNav() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  // [SELF-SERVICE-1] Account menu dropdown state
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const isAuth = isAuthenticated();
    setAuthenticated(isAuth);

    // Fetch user data to check role
    if (isAuth) {
      usersApi.me().then((userData: User) => {
        setUser(userData);
      }).catch(() => {
        // If fetch fails, clear auth state
        removeToken();
        setAuthenticated(false);
      });
    }
  }, []);

  // [SELF-SERVICE-1] Close account menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }

    if (accountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [accountMenuOpen]);

  const handleSignOut = () => {
    removeToken();
    router.push('/login');
  };

  // Prevent hydration mismatch by not rendering auth-dependent UI until mounted
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <GuardedLink
                href="/projects"
                className="flex items-center px-2 py-2"
              >
                <Image
                  src="/branding/engineo/logo-light.png"
                  alt="EngineO.ai"
                  width={160}
                  height={40}
                  priority
                />
              </GuardedLink>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <GuardedLink
              href="/projects"
              className="flex items-center px-2 py-2"
            >
              <Image
                src="/branding/engineo/logo-light.png"
                alt="EngineO.ai"
                width={160}
                height={40}
                priority
              />
            </GuardedLink>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <GuardedLink
                href="/projects"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                Projects
              </GuardedLink>
              <GuardedLink
                href="/settings"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                Settings
              </GuardedLink>
              {user?.role === 'ADMIN' && !!user?.adminRole && (
                <GuardedLink
                  href="/admin"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-purple-700 hover:text-purple-900"
                >
                  Admin
                </GuardedLink>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {authenticated ? (
              <>
                {/* [SELF-SERVICE-1] Account Menu Dropdown */}
                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    <span className="sr-only">Open account menu</span>
                    <svg
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Account
                    <svg
                      className={`ml-1 h-4 w-4 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1" role="menu">
                        {/* User info header */}
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>

                        {/* Account menu items */}
                        <GuardedLink
                          href="/settings/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          Profile
                        </GuardedLink>
                        <GuardedLink
                          href="/settings/organization"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          Organization / Stores
                        </GuardedLink>
                        <GuardedLink
                          href="/settings/billing"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          Plan & Billing
                        </GuardedLink>
                        <GuardedLink
                          href="/settings/ai-usage"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          AI Usage
                        </GuardedLink>
                        <GuardedLink
                          href="/settings/preferences"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          Preferences
                        </GuardedLink>
                        <GuardedLink
                          href="/settings/security"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          Security
                        </GuardedLink>
                        <GuardedLink
                          href="/settings/help"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          Help & Support
                        </GuardedLink>

                        {/* Admin link (gated to internal admins) */}
                        {user?.role === 'ADMIN' && !!user?.adminRole && (
                          <>
                            <div className="border-t border-gray-100 my-1" />
                            <GuardedLink
                              href="/admin"
                              className="block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50"
                              onClick={() => setAccountMenuOpen(false)}
                            >
                              Admin Dashboard
                            </GuardedLink>
                          </>
                        )}

                        {/* Sign out */}
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            handleSignOut();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <GuardedLink
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600"
                >
                  Sign in
                </GuardedLink>
                <GuardedLink
                  href="/signup"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign up
                </GuardedLink>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
