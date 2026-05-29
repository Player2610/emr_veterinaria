import type { LucideIcon } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Badge count shown in sidebar (e.g. pending appointments) */
  badge?: number;
  /** Sub-items for grouped navigation */
  children?: Omit<NavItem, 'children'>[];
  /** Roles allowed to see this item. Empty = visible to all. */
  roles?: string[];
}

export interface RouteConfig {
  path: string;
  /** Page title shown in the breadcrumb / document title */
  title: string;
  /** Whether the route requires authentication */
  protected: boolean;
}

export interface AppModule {
  id: string;
  navItems: NavItem[];
  routes: RouteConfig[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry implementation
// ─────────────────────────────────────────────────────────────────────────────

class ModuleRegistry {
  private modules = new Map<string, AppModule>();

  register(module: AppModule): void {
    if (this.modules.has(module.id)) {
      console.warn(
        `[ModuleRegistry] Module "${module.id}" is already registered and will be overwritten.`,
      );
    }
    this.modules.set(module.id, module);
  }

  unregister(moduleId: string): void {
    this.modules.delete(moduleId);
  }

  getModule(moduleId: string): AppModule | undefined {
    return this.modules.get(moduleId);
  }

  getNavItems(): NavItem[] {
    const items: NavItem[] = [];
    for (const module of this.modules.values()) {
      items.push(...module.navItems);
    }
    return items;
  }

  getRoutes(): RouteConfig[] {
    const routes: RouteConfig[] = [];
    for (const module of this.modules.values()) {
      routes.push(...module.routes);
    }
    return routes;
  }

  /** Returns the page title for a given pathname, or undefined. */
  getTitleForPath(pathname: string): string | undefined {
    for (const route of this.getRoutes()) {
      if (route.path === pathname) return route.title;
    }
    return undefined;
  }
}

export const moduleRegistry = new ModuleRegistry();

// ─────────────────────────────────────────────────────────────────────────────
// Built-in core module (registered at app startup)
// ─────────────────────────────────────────────────────────────────────────────
// Icons are imported lazily in the sidebar component to avoid circular deps.
// Here we store the icon name as a string and the sidebar resolves it.

import {
  LayoutDashboard,
  PawPrint,
  Users,
  CalendarDays,
  FileText,
  Settings,
} from 'lucide-react';

export const CORE_MODULE: AppModule = {
  id: 'core',
  navItems: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      id: 'pets',
      label: 'Mascotas',
      href: '/pets',
      icon: PawPrint,
    },
    {
      id: 'owners',
      label: 'Propietarios',
      href: '/owners',
      icon: Users,
    },
    {
      id: 'appointments',
      label: 'Citas',
      href: '/appointments',
      icon: CalendarDays,
    },
    {
      id: 'medical-records',
      label: 'Historial médico',
      href: '/medical-records',
      icon: FileText,
    },
    {
      id: 'settings',
      label: 'Configuración',
      href: '/settings',
      icon: Settings,
    },
  ],
  routes: [
    { path: '/', title: 'Dashboard', protected: true },
    { path: '/pets', title: 'Mascotas', protected: true },
    { path: '/owners', title: 'Propietarios', protected: true },
    { path: '/appointments', title: 'Citas', protected: true },
    { path: '/medical-records', title: 'Historial médico', protected: true },
    { path: '/settings', title: 'Configuración', protected: true },
    { path: '/settings/theme', title: 'Editor de tema', protected: true },
  ],
};

// Register the core module immediately so the sidebar has items on first render
moduleRegistry.register(CORE_MODULE);
