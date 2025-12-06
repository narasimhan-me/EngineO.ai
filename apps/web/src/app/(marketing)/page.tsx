'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function MarketingHomePage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/projects');
    }
  }, [router]);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-slate-100 bg-gradient-to-b from-blue-50/40 to-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:py-24 lg:px-8">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Discovery Engine Optimization (DEO) for modern brands
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Optimize any website for search & AI discovery.
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              EngineO.ai is the Discovery Engine Optimization (DEO) platform that unifies SEO, AEO,
              PEO, and VEO so any site — ecommerce, SaaS, content, or blog — can be optimized for
              search results and AI answers from one place.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Start free — no credit card
              </Link>
              <Link
                href="/features"
                className="text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Learn how EngineO.ai works &rarr;
              </Link>
            </div>

            <dl className="mt-6 grid gap-4 text-xs text-slate-600 sm:grid-cols-2 sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600">
                  🔍
                </span>
                <div>
                  <dt className="font-semibold text-slate-800">Instant discovery audit</dt>
                  <dd>Scan pages, products, and entities in a few clicks.</dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600">
                  🤖
                </span>
                <div>
                  <dt className="font-semibold text-slate-800">AI metadata &amp; answer content</dt>
                  <dd>
                    Titles, descriptions, alt text, FAQs, and answer blocks generated for you.
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600">
                  🛒
                </span>
                <div>
                  <dt className="font-semibold text-slate-800">Store, site &amp; content discovery</dt>
                  <dd>
                    Sync, optimize, and push changes back to your storefronts, sites, and content
                    — across ecommerce, SaaS, and media.
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600">
                  🚀
                </span>
                <div>
                  <dt className="font-semibold text-slate-800">Automated DEO improvements</dt>
                  <dd>Ongoing automations keep your discovery footprint improving.</dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Right column: dashboard mock */}
          <div className="flex-1">
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:max-w-lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">DEO overview</h3>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Live preview
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-blue-50 p-3">
                  <p className="text-[11px] font-medium text-blue-700">SEO health</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">82</p>
                  <p className="mt-1 text-[11px] text-blue-800">+17 in last 30 days</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-700">Products optimized</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">134</p>
                  <p className="mt-1 text-[11px] text-slate-500">of 500 total</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-700">Issues fixed</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">312</p>
                  <p className="mt-1 text-[11px] text-slate-500">titles, metas &amp; links</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Run full store audit</p>
                    <p className="text-[11px] text-slate-500">Scan products, pages &amp; blog posts.</p>
                  </div>
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                    Scan now
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Apply AI metadata</p>
                    <p className="text-[11px] text-slate-500">
                      Approve &amp; publish AI titles in bulk.
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                    Review
                  </span>
                </div>
              </div>

              <p className="mt-4 text-[11px] text-slate-500">
                Mock data shown. Real dashboards appear after connecting your sites and data
                sources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DEO components */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            What DEO optimizes
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            EngineO.ai looks at your discovery footprint across four pillars so you can see where
            to improve first.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Content</h3>
              <p className="mt-2 text-xs text-slate-600">
                Page copy, product descriptions, and answer-ready content that determine how well
                you explain what you do.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Entities</h3>
              <p className="mt-2 text-xs text-slate-600">
                Brands, products, services, and topics that AI assistants and search engines use to
                understand your business.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Technical</h3>
              <p className="mt-2 text-xs text-slate-600">
                Crawl health, indexability, and on-page structure that determine whether you&apos;re
                even eligible to show up.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Visibility</h3>
              <p className="mt-2 text-xs text-slate-600">
                How often you appear across search results, answer boxes, AI assistants, and other
                discovery surfaces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Issues Engine */}
      <section className="border-b border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Issues Engine: see what to fix first
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            EngineO.ai turns crawls, DEO signals, and product data into an actionable Issues
            Engine so you always know where to focus.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">Metadata &amp; thin content</h3>
              <p className="mt-2 text-xs text-slate-600">
                Missing titles and descriptions, short product copy, and weak landing pages surfaced
                in one place — with counts and examples.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Crawl, indexability &amp; answer gaps
              </h3>
              <p className="mt-2 text-xs text-slate-600">
                Broken pages, HTTP errors, missing H1s, and weak answer surfaces flagged before
                they hurt search and AI visibility.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">Prioritized, not overwhelming</h3>
              <p className="mt-2 text-xs text-slate-600">
                Issues are grouped and prioritized so you can fix a handful of high-impact problems
                instead of wading through endless audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Optimization Workspaces */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Optimization workspaces you can actually live in
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Instead of generic forms, EngineO.ai gives you dedicated workspaces for each surface
            that matters.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Product Optimization Workspace</h3>
              <p className="mt-2 text-xs text-slate-600">
                See DEO signals, issues, and AI suggestions for each product in one place. Approve
                titles and descriptions, then push updates back to your storefront.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Content Optimization Workspace</h3>
              <p className="mt-2 text-xs text-slate-600">
                Optimize landing pages, blog posts, docs, and static pages with AI metadata, DEO
                insights, and thin-content checks tailored to each URL.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="border-b border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Works with the stack you already have
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            EngineO.ai is designed to sit above your existing ecommerce, CMS, and web stack — not
            replace it.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">Ecommerce</h3>
              <p className="mt-2 text-xs text-slate-600">
                Online stores running on modern platforms — from Shopify and WooCommerce to
                headless storefronts — can plug into DEO scoring and product workspaces.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">CMS &amp; marketing sites</h3>
              <p className="mt-2 text-xs text-slate-600">
                Blogs, docs, and marketing pages powered by WordPress, Webflow, headless CMSs, or
                custom Next.js apps get the same DEO audits and content workspaces.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">Headless &amp; custom</h3>
              <p className="mt-2 text-xs text-slate-600">
                Bring your own APIs, data sources, and multi-brand sites. EngineO.ai focuses on
                crawl results and entities, not a single platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for + CTA */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Who EngineO.ai is for
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                EngineO.ai is built for teams who need to keep multiple surfaces discoverable
                without adding headcount.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Ecommerce &amp; retail brands
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    Optimize products, collections, and content to win discovery across search,
                    marketplaces, and AI assistants.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">SaaS &amp; B2B teams</h3>
                  <p className="mt-2 text-xs text-slate-600">
                    Make docs, feature pages, and solution content easier to find for both humans
                    and AI copilots.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Publishers &amp; media</h3>
                  <p className="mt-2 text-xs text-slate-600">
                    Keep high-value content, hubs, and evergreen articles tuned for search and
                    answer surfaces.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Agencies &amp; partners</h3>
                  <p className="mt-2 text-xs text-slate-600">
                    Standardize DEO audits, workspaces, and reporting across multiple clients
                    without building your own tooling.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Ready to make your brand discoverable everywhere?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Start with a single project, connect your sites, and see your DEO issues,
                workspaces, and scores in one place — in under an hour.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Get started with EngineO.ai
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Talk to the founder &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            How EngineO.ai works
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            From connection to ongoing Discovery Engine Optimization in four simple steps.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              {
                title: 'Connect your site & store',
                desc: 'Connect your store, CMS, or website in a few clicks. No theme edits required.',
                step: 'Step 1',
              },
              {
                title: 'Run a DEO discovery scan',
                desc: 'Pages, products, entities, and metadata are analyzed for search and AI visibility.',
                step: 'Step 2',
              },
              {
                title: 'Apply AI-powered fixes',
                desc: 'Generate and approve metadata, FAQs, schema, and answer-ready content in bulk.',
                step: 'Step 3',
              },
              {
                title: 'Monitor visibility & improve',
                desc: 'Track your DEO score and keep your discovery footprint improving over time.',
                step: 'Step 4',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700">
                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-xs text-slate-600">{item.desc}</p>
                <span className="absolute right-4 top-4 text-xs font-semibold text-slate-300">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

