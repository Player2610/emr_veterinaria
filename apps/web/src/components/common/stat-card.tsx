import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  isLoading?: boolean;
  className?: string;
  iconClassName?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  isLoading,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            ) : (
              <p className="text-3xl font-bold tracking-tight">{value}</p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p
                className={cn(
                  'text-xs font-medium',
                  trend.positive ? 'text-success' : 'text-destructive',
                )}
              >
                {trend.positive ? '+' : ''}
                {trend.value}% {trend.label}
              </p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10',
                iconClassName,
              )}
            >
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
