'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { useAppointments } from '@/hooks/use-api';
import { APPOINTMENT_STATUS_LABELS, AppointmentStatus } from '@emr/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AppointmentForm } from './appointment-form';
import type { Appointment } from '@/hooks/use-api';

const STATUS_COLOUR: Record<string, string> = {
  [AppointmentStatus.CONFIRMED]: 'bg-success/15 text-success border-success/30',
  [AppointmentStatus.PENDING_CONFIRMATION]: 'bg-warning/15 text-warning border-warning/30',
  [AppointmentStatus.IN_PROGRESS]: 'bg-info/15 text-info border-info/30',
  [AppointmentStatus.COMPLETED]: 'bg-muted text-muted-foreground border-border',
  [AppointmentStatus.CANCELLED]: 'bg-destructive/10 text-destructive border-destructive/20',
  [AppointmentStatus.NO_SHOW]: 'bg-destructive/10 text-destructive border-destructive/20',
  [AppointmentStatus.RESCHEDULED]: 'bg-secondary text-secondary-foreground border-border',
};

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday-first
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

interface AppointmentCalendarProps {
  className?: string;
}

export function AppointmentCalendar({ className }: AppointmentCalendarProps) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);

  const weekEnd = addDays(weekStart, 6);

  const { data, isLoading, mutate } = useAppointments({
    from: weekStart.toISOString(),
    to: weekEnd.toISOString(),
  });

  const appointments = data?.items ?? [];

  // Group appointments by day ISO string
  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const apt of appointments) {
      const dayKey = apt.scheduledAt.slice(0, 10);
      if (!map.has(dayKey)) map.set(dayKey, []);
      map.get(dayKey)!.push(apt);
    }
    return map;
  }, [appointments]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date().toISOString().slice(0, 10);

  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));

  const weekLabel = `${weekStart.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })} — ${weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek} aria-label="Semana anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[220px] text-center text-sm font-medium">{weekLabel}</span>
          <Button variant="outline" size="icon" onClick={nextWeek} aria-label="Semana siguiente">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart(getWeekStart(new Date()))}
          >
            Hoy
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Nueva cita
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva cita</DialogTitle>
            </DialogHeader>
            <AppointmentForm
              onSuccess={() => {
                setDialogOpen(false);
                mutate();
              }}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Week grid */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day, i) => {
            const isoDay = day.toISOString().slice(0, 10);
            const isToday = isoDay === today;
            return (
              <div
                key={isoDay}
                className={cn(
                  'flex flex-col items-center py-3 text-sm border-r border-border last:border-r-0',
                  isToday && 'bg-primary/5',
                )}
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {DAY_NAMES[i]}
                </span>
                <span
                  className={cn(
                    'mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                    isToday && 'bg-primary text-primary-foreground',
                  )}
                >
                  {day.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Appointment rows */}
        <div className="grid grid-cols-7 min-h-[240px]">
          {weekDays.map((day) => {
            const isoDay = day.toISOString().slice(0, 10);
            const isToday = isoDay === today;
            const dayApts = byDay.get(isoDay) ?? [];

            return (
              <div
                key={isoDay}
                className={cn(
                  'border-r border-border last:border-r-0 p-2 space-y-1',
                  isToday && 'bg-primary/5',
                )}
              >
                {isLoading
                  ? Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                    ))
                  : dayApts.map((apt) => (
                      <div
                        key={apt.id}
                        className={cn(
                          'rounded-md border px-2 py-1.5 text-xs transition-shadow hover:shadow-sm cursor-pointer',
                          STATUS_COLOUR[apt.status] ?? 'bg-muted text-muted-foreground',
                        )}
                        title={`${apt.pet.name} — ${apt.type}`}
                      >
                        <p className="font-semibold truncate">{formatTime(apt.scheduledAt)}</p>
                        <p className="truncate">{apt.pet.name}</p>
                      </div>
                    ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
