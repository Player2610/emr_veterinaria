import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider';

export const metadata: Metadata = {
  title: {
    default: 'EMR Veterinaria',
    template: '%s | EMR Veterinaria',
  },
  description: 'Sistema de gestión veterinaria multi-tenant',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  // In a real app, tenantConfig would be fetched in a Server Component using
  // the subdomain from headers(). Here we pass a static default so the app
  // renders correctly during development without a backend.
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          tenantConfig={{
            tenantId: process.env.NEXT_PUBLIC_DEV_TENANT_ID ?? 'default',
            tenantName: 'Clínica Veterinaria',
          }}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
