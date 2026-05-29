import type { ReactNode } from 'react';
import { PawPrint } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-md">
            <PawPrint className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">EMR Veterinaria</h1>
          <p className="text-sm text-muted-foreground">
            Sistema de gestión veterinaria
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
