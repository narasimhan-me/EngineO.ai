import type { Metadata } from 'next';
import MarketingNavbar from '@/components/marketing/MarketingNavbar';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'EngineO.ai — Discovery Engine Optimization for modern brands',
    template: '%s | EngineO.ai',
  },
  description:
    'EngineO.ai is the AI-first Discovery Engine Optimization platform that scans your site and store, fixes technical issues, maps entities, writes metadata and answer-ready content, and tracks visibility across search and AI surfaces.',
  openGraph: {
    title: 'EngineO.ai — Discovery Engine Optimization for modern brands',
    description:
      'EngineO.ai is the AI-first Discovery Engine Optimization platform that scans your site and store, fixes technical issues, maps entities, writes metadata and answer-ready content, and tracks visibility across search and AI surfaces.',
    url: '/',
    siteName: 'EngineO.ai',
    type: 'website',
    images: [
      {
        url: '/branding/engineo/logo-light.png',
        width: 1200,
        height: 630,
        alt: 'EngineO.ai — Discovery Engine Optimization (DEO)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EngineO.ai — Discovery Engine Optimization for modern brands',
    description:
      'EngineO.ai is the AI-first Discovery Engine Optimization platform that scans your site and store, fixes technical issues, maps entities, writes metadata and answer-ready content, and tracks visibility across search and AI surfaces.',
    images: ['/branding/engineo/logo-light.png'],
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'EngineO.ai',
  url: 'https://engineo.ai',
  logo: 'https://engineo.ai/branding/engineo/logo-light.png',
  sameAs: [],
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <MarketingNavbar />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
