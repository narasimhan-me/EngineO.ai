import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EngineO.ai – Discovery Engine Optimization on Autopilot',
  description:
    'EngineO.ai is the AI-first Discovery Engine Optimization (DEO) platform for websites, stores, and brands that want to stay visible across search engines and AI assistants.',
  icons: {
    icon: '/branding/engineo/logo-light.png',
    apple: '/branding/engineo/logo-light.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
