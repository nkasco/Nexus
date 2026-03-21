import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nexus Operator Shell',
  description: 'Single-pane-of-glass homelab and DevOps dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      data-accent="graphite"
      data-theme="dark"
      lang="en"
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
