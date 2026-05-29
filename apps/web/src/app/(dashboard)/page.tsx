'use client';

import { PawPrint, CalendarDays, Users, CreditCard } from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-api';
import { StatCard } from '@/components/common/stat-card';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Mini bar chart (CSS-only, no external chart lib dependency)
// ─────────────────────────────────────────────────────────────────────────────

interface BarChartProps {
  data: { date: string; count: number }[];
}

function WeeklyBarChart({ data }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex h-32 items-end gap-1.5">
      {data.map((d) => {
        const pct = Math.round((d.count / max) * 100);
        const label = new Date(d.date).toLocaleDateString('es-ES', {
          weekday: 'short',
        });
        return (
          <div key={d.date} className="group flex flex-1 flex-col items-center gap-1">
            <div className="relative w-full">
              <div
                className="w-full rounded-t-sm bg-primary transition-all duration-300 group-hover:bg-primary/80"
                style={{ height: `${Math.max(pct, 4)}%`, minHeight: '4px' }}
                title={`${d.count} citas`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground capitalize">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboardStats();

  const stats = data ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Vista general de la clínica"
        showBreadcrumbs={false}
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total mascotas"
          value={stats?.totalPets ?? '—'}
          icon={PawPrint}
          trend={{ value: 8, label: 'vs mes anterior', positive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Citas hoy"
          value={stats?.appointmentsToday ?? '—'}
          icon={CalendarDays}
          description="Programadas para hoy"
          isLoading={isLoading}
        />
        <StatCard
          title="Nuevos clientes"
          value={stats?.newClientsThisMonth ?? '—'}
          icon={Users}
          description="Este mes"
          trend={{ value: 15, label: 'vs mes anterior', positive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Pendientes de pago"
          value={stats?.pendingPayments ?? '—'}
          icon={CreditCard}
          description="Facturas por cobrar"
          trend={{ value: 3, label: 'vs semana anterior', positive: false }}
          isLoading={isLoading}
        />
      </div>

      {/* Chart */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Citas por día (última semana)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-32 animate-pulse rounded bg-muted" />
            ) : (
              <WeeklyBarChart data={stats?.appointmentsPerDay ?? []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accesos rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { label: 'Nueva mascota', href: '/pets', icon: PawPrint },
              { label: 'Nueva cita', href: '/appointments', icon: CalendarDays },
              { label: 'Nuevo cliente', href: '/owners', icon: Users },
              { label: 'Ver pagos', href: '/settings', icon: CreditCard },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-center text-xs font-medium transition-colors hover:bg-accent"
              >
                <item.icon className="h-5 w-5 text-primary" />
                {item.label}
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
