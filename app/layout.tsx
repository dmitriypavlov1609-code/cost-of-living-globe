import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cost of Living Globe',
  description: 'Explore cost of living around the world — rent, food, transport and more.',
  openGraph: {
    title: 'Cost of Living Globe',
    description: 'Explore cost of living around the world',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
