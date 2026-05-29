'use client';

import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  type TenantTheme,
  DEFAULT_THEME,
  applyThemeToDOM,
} from '@/lib/theme';
import { CssVarsInjector } from './css-vars-injector';

// ─────────────────────────────────────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────────────────────────────────────

export interface ThemeContextValue {
  theme: TenantTheme;
  updateTheme: (patch: Partial<TenantTheme>) => void;
  resetTheme: () => void;
  isDirty: boolean;
  // Tenant metadata
  tenantId: string;
  tenantName: string;
  logoUrl?: string;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface TenantConfig {
  tenantId: string;
  tenantName: string;
  logoUrl?: string;
  theme?: Partial<TenantTheme>;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  /**
   * Tenant configuration fetched server-side (e.g. from middleware or a
   * server component). When not provided, the default theme is used.
   */
  tenantConfig?: TenantConfig;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function ThemeProvider({ children, tenantConfig }: ThemeProviderProps) {
  const initialTheme: TenantTheme = {
    ...DEFAULT_THEME,
    ...(tenantConfig?.theme ?? {}),
  };

  const [theme, setTheme] = useState<TenantTheme>(initialTheme);
  const [isDirty, setIsDirty] = useState(false);
  const originalThemeRef = useRef<TenantTheme>(initialTheme);

  // Apply to DOM whenever theme changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const updateTheme = useCallback((patch: Partial<TenantTheme>) => {
    setTheme((prev) => {
      const next = { ...prev, ...patch };
      return next;
    });
    setIsDirty(true);
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(originalThemeRef.current);
    setIsDirty(false);
  }, []);

  const value: ThemeContextValue = {
    theme,
    updateTheme,
    resetTheme,
    isDirty,
    tenantId: tenantConfig?.tenantId ?? 'default',
    tenantName: tenantConfig?.tenantName ?? 'Clínica Veterinaria',
    logoUrl: tenantConfig?.logoUrl,
  };

  return (
    <ThemeContext.Provider value={value}>
      {/* SSR-safe CSS var injection via a <style> tag */}
      <CssVarsInjector theme={theme} />
      {children}
    </ThemeContext.Provider>
  );
}
