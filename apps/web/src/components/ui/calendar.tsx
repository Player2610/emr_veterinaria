'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

// ─────────────────────────────────────────────────────────────────────────────
// Simple calendar — month view that shows days and highlights a set of dates.
// For a full-featured calendar, integrate react-big-calendar or similar.
// ─────────────────────────────────────────────────────────────────────────────

interface CalendarProps {
  className?: string;
  /** ISO date strings to highlight */
  highlightedDates?: string[];
  /** Currently selected date */
  selected?: Date;
  onSelect?: (date: Date) => void;
}

function Calendar({ className, highlightedDates = [], selected, onSelect }: CalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const startWeekday = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const monthName = firstDay.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const highlightSet = new Set(highlightedDates);
  const dayNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  return (
    <div className={cn('w-full rounded-lg border border-border bg-card p-4', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Mes anterior">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold capitalize">{monthName}</span>
        <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Mes siguiente">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
        {dayNames.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-px">
        {/* Empty cells before first day */}
        {Array.from({ length: startWeekday }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(viewYear, viewMonth, day);
          const isoStr = date.toISOString().slice(0, 10);
          const isToday =
            day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear();
          const isSelected =
            selected &&
            day === selected.getDate() &&
            viewMonth === selected.getMonth() &&
            viewYear === selected.getFullYear();
          const isHighlighted = highlightSet.has(isoStr);

          return (
            <button
              key={day}
              onClick={() => onSelect?.(date)}
              className={cn(
                'relative flex h-8 w-full items-center justify-center rounded-md text-sm transition-colors hover:bg-accent',
                isToday && 'font-bold text-primary',
                isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                isHighlighted && !isSelected && 'bg-primary/10 text-primary',
              )}
            >
              {day}
              {isHighlighted && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar };
