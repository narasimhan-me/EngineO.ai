import type { Metadata } from 'next';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact — EngineO.ai DEO Platform',
  description:
    'Get in touch with the EngineO.ai team for support, partnerships, or enterprise plans related to Discovery Engine Optimization (DEO: SEO + AEO + PEO + VEO).',
};

export default function ContactPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            We&apos;re here to help.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-600">
            For support, partnerships, or enterprise plans, drop us a message.
            We read every request and usually respond in under 24 hours.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
            {/* Form */}
            <ContactForm />

            {/* Right column info */}
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
              <h2 className="text-sm font-semibold text-slate-900">Contact details</h2>
              <p>
                <span className="font-medium text-slate-900">Support</span>
                <br />
                <a
                  href="mailto:support@engineo.ai"
                  className="text-blue-700 hover:text-blue-800"
                >
                  support@engineo.ai
                </a>
                <br />
                Typical response: under 24 hours.
              </p>

              <p>
                <span className="font-medium text-slate-900">Partnerships</span>
                <br />
                For agencies, platforms, and integration partners, use the form
                or reach out via email and mention your use case.
              </p>

              <p>
                <span className="font-medium text-slate-900">Roadmap</span>
                <br />
                Early adopters get direct input into our roadmap across Shopify,
                content, automation, and reporting features.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
