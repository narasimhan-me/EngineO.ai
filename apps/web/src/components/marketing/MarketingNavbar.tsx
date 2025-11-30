'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function MarketingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and nav links */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo/SEOEngine_logo.png"
                alt="SEOEngine.io"
                width={160}
                height={40}
                priority
              />
            </Link>
            <div className="hidden md:flex md:ml-10 md:space-x-8">
              <Link
                href="/features"
                className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>

          {/* Right side - Auth links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-sky-500 hover:bg-sky-600 transition-colors"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900 p-2"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="space-y-2">
              <Link
                href="/features"
                className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <Link
                  href="/login"
                  className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 text-base font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
