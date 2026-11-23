import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/features/auth/context';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'Marketplace | Business Discovery & Inquiry Platform',
  description: 'Discover local businesses, explore products & services, and send direct inquiries.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
