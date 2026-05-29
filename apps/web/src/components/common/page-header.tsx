import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  showBreadcrumbs?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  showBreadcrumbs = true,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {showBreadcrumbs && <Breadcrumbs />}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
