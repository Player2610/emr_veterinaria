'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';
import { moduleRegistry } from '@/lib/registry';
import { useTenant } from '@/hooks/use-tenant';
import { Badge } from '@/components/ui/badge';

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar — reads nav items from the module registry so it stays in sync with
// whatever modules are registered at runtime.
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { tenantName, logoUrl } = useTenant();
  const navItems = moduleRegistry.getNavItems();

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground',
        className,
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={tenantName} className="h-8 w-8 rounded object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <PawPrint className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
        <span className="truncate text-sm font-semibold">{tenantName}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-0.5 px-3">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0 transition-colors',
                      isActive ? 'text-primary' : 'text-sidebar-muted-foreground group-hover:text-sidebar-accent-foreground',
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge className="h-5 min-w-[1.25rem] justify-center rounded-full px-1.5 text-[10px]">
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <p className="text-center text-[11px] text-sidebar-muted-foreground">
          EMR Veterinaria v0.1
        </p>
      </div>
    </aside>
  );
}
