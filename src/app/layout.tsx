import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Matrix AI - Lead Generator | Smart B2B Lead Discovery',
  description: 'Matrix AI Lead Generator - Discover and enrich B2B company leads using intelligent web analysis. Professional lead generation powered by AI.',
  keywords: ['Matrix AI', 'lead generation', 'b2b leads', 'AI leads', 'company discovery', 'sales intelligence'],
  authors: [{ name: 'Matrix Digital AI' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Matrix AI Lead Generator',
    description: 'Intelligent B2B lead discovery platform powered by AI',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50`}>
        {children}
      </body>
    </html>
  );
}
