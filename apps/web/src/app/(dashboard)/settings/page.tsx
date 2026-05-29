import type { Metadata } from 'next';
import Link from 'next/link';
import { Palette, Building2, Bell, Shield } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Configuración' };

const sections = [
  {
    href: '/settings/theme',
    icon: Palette,
    title: 'Editor de tema',
    description: 'Personaliza los colores, tipografía y aspecto visual de tu clínica.',
  },
  {
    href: '/settings',
    icon: Building2,
    title: 'Información de la clínica',
    description: 'Nombre, logo, dirección y datos de contacto.',
    disabled: true,
  },
  {
    href: '/settings',
    icon: Bell,
    title: 'Notificaciones',
    description: 'Configura alertas de citas, recordatorios y avisos del sistema.',
    disabled: true,
  },
  {
    href: '/settings',
    icon: Shield,
    title: 'Seguridad y accesos',
    description: 'Gestiona roles, permisos y autenticación de dos factores.',
    disabled: true,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" description="Ajustes de tu clínica veterinaria" />

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className={section.disabled ? 'pointer-events-none opacity-50' : ''}
            aria-disabled={section.disabled}
          >
            <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">
                    {section.title}
                    {section.disabled && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        Próximamente
                      </span>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{section.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
