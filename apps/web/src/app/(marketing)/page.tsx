'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/projects');
    }
  }, [router]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">
              AI SEO for eCommerce{' '}
              <span className="text-sky-500">That Runs Itself</span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto">
              SEOEngine.io optimizes your products, pages, metadata, content, and rankings — fully automated, powered by AI.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-lg"
              >
                Start Free — No Credit Card Required
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg border-2 border-slate-300 text-slate-700 hover:border-sky-500 hover:text-sky-600 transition-colors"
              >
                Learn how it works
              </Link>
            </div>
            {/* Hero Highlights */}
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="text-sky-500">✨</span>
                <span>AI SEO Automation</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="text-sky-500">🛍️</span>
                <span>Shopify-Ready</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="text-sky-500">🚀</span>
                <span>Faster Growth in Weeks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar / Social Proof */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-500 text-sm font-medium mb-6">
            Trusted by eCommerce founders, marketers, and Shopify brands
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-slate-400">Brand</div>
            <div className="text-2xl font-bold text-slate-400">Brand</div>
            <div className="text-2xl font-bold text-slate-400">Brand</div>
            <div className="text-2xl font-bold text-slate-400">Brand</div>
            <div className="text-2xl font-bold text-slate-400">Brand</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">
              Get your SEO optimized in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center text-xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Connect Your Store
              </h3>
              <p className="text-slate-600">
                One-click Shopify integration. Secure OAuth gets you set up without any code changes.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center text-xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                AI Scans Everything
              </h3>
              <p className="text-slate-600">
                Products, pages, metadata, performance, keywords — our AI analyzes it all.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center text-xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Auto-Optimize
              </h3>
              <p className="text-slate-600">
                Fixes issues, improves metadata, compresses images, generates alt text automatically.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center text-xl font-bold mb-6">
                4
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Grow & Track
              </h3>
              <p className="text-slate-600">
                Live dashboards, weekly insights, automated reports. Watch your rankings climb.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What SEOEngine Does - Core Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Automated SEO that actually moves revenue
            </h2>
            <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">
              Not just rankings — real business results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 - AI SEO Fixes */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">AI SEO Fixes</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• Auto-optimize titles & descriptions</li>
                <li>• Fix missing alt tags</li>
                <li>• Identify broken links</li>
                <li>• Schema markup added automatically</li>
              </ul>
            </div>

            {/* Card 2 - Shopify Product SEO */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Shopify Product SEO</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• Sync products instantly</li>
                <li>• AI-written product metadata</li>
                <li>• Auto-publish SEO updates</li>
                <li>• Smart collections & structured data</li>
              </ul>
            </div>

            {/* Card 3 - Content Intelligence */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Content Intelligence</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• Keyword clustering</li>
                <li>• Competitor gap analysis</li>
                <li>• AI blog & landing page generation</li>
                <li>• Quality & readability scoring</li>
              </ul>
            </div>

            {/* Card 4 - Performance Insights */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Performance Insights</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• SEO health score</li>
                <li>• Crawl overview</li>
                <li>• Weekly automated reports</li>
                <li>• Issue trends over time</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Your entire SEO workflow in one beautiful dashboard
            </h2>
            <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto">
              See everything that matters — your products, pages, issues, scores, insights, and improvements — all in one place.
            </p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <div className="aspect-video bg-slate-700 rounded-lg flex items-center justify-center">
              <span className="text-slate-500 text-lg">Dashboard Screenshot Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Shopify Integration Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Powerful Shopify SEO — Fully Automated
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Sync products, collections, images, variants, and metadata. SEOEngine.io updates your store automatically.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">Auto-optimize metadata</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">Auto-generate alt tags</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">Auto-update schema</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">Auto-publish SEO improvements</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">Sync new products instantly</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="inline-flex items-center mt-8 px-6 py-3 text-lg font-semibold rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors"
              >
                Connect Shopify Store
              </Link>
            </div>
            <div className="bg-slate-100 rounded-2xl p-8">
              <div className="aspect-square bg-slate-200 rounded-lg flex items-center justify-center">
                <span className="text-slate-400 text-lg">Shopify Integration Visual</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI SEO Automation Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-white rounded-2xl p-8 border border-slate-200">
              <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="text-slate-400 text-lg">AI Automation Visual</span>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Automate 90% of SEO Work
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Let AI handle the tedious tasks while you focus on growing your business.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">Fix missing titles, meta descriptions, H1 issues</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">Generate SEO metadata in bulk</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">Internal linking engine (auto suggestions)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">Auto-compress and optimize images</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">Auto-detect broken links</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">Auto-generate schema</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Content AI Engine Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                AI That Writes Like Your Brand
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Generate high-quality content that matches your brand voice and drives conversions.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">AI product description writer</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">AI blog writer</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">AI landing page generator</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">Brand tone + style memory</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">Keyword clustering</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">✓</span>
                  <span className="text-slate-700">Competitor content gap analysis</span>
                </li>
              </ul>
              <Link
                href="/features"
                className="inline-flex items-center mt-8 px-6 py-3 text-lg font-semibold rounded-lg border-2 border-sky-500 text-sky-600 hover:bg-sky-50 transition-colors"
              >
                Explore AI Content Tools
              </Link>
            </div>
            <div className="bg-slate-100 rounded-2xl p-8">
              <div className="aspect-square bg-slate-200 rounded-lg flex items-center justify-center">
                <span className="text-slate-400 text-lg">Content AI Visual</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Performance Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Monitor Your SEO Health in Real-Time
            </h2>
            <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">
              Stay on top of your SEO performance with comprehensive monitoring and reporting.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-xl p-6 text-center border border-slate-200">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Keyword Ranking</h3>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border border-slate-200">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">GSC Integration</h3>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border border-slate-200">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Performance Reports</h3>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border border-slate-200">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Crawl Issues</h3>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border border-slate-200">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Weekly Summaries</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Loved by eCommerce Teams
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              <p className="text-lg text-slate-700 mb-6">
                &ldquo;SEOEngine.io replaced 3 tools for us. Our organic traffic grew 51% in 60 days.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-semibold">
                  AL
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Amy L.</p>
                  <p className="text-slate-500 text-sm">Shopify Seller</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              <p className="text-lg text-slate-700 mb-6">
                &ldquo;The AI metadata generator is insanely good. What took hours now takes seconds.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-semibold">
                  MT
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Marcus T.</p>
                  <p className="text-slate-500 text-sm">eCom Founder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Put Your SEO on Autopilot?
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            Join merchants who are scaling faster with AI-powered SEO.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-lg"
          >
            Start Free Today
          </Link>
          <p className="mt-4 text-sm text-slate-400">
            Free plan available. No credit card required.
          </p>
        </div>
      </section>
    </div>
  );
}
