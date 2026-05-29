import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { TenantTheme, TenantThemeColors } from '@emr/shared';
import { hslToHex } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

/** React Native–friendly color tokens resolved from TenantThemeColors */
export interface ResolvedColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  surface: string;
  foreground: string;
  mutedForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface ThemeContextValue {
  /** The raw TenantTheme from the backend */
  tenantTheme: TenantTheme | null;
  /** RN-compatible color tokens (hex strings) */
  colors: ResolvedColors;
  /** Clinic display name */
  clinicName: string;
  /** Logo URL (main) */
  logoUrl: string | null;
  /** Update the theme when tenant data is loaded */
  setTenantTheme: (theme: TenantTheme) => void;
  /** Clear tenant theme on logout */
  clearTenantTheme: () => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_COLORS: ResolvedColors = {
  primary: '#2563EB',
  primaryForeground: '#FFFFFF',
  secondary: '#7C3AED',
  secondaryForeground: '#FFFFFF',
  accent: '#0EA5E9',
  accentForeground: '#FFFFFF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  foreground: '#0F172A',
  mutedForeground: '#64748B',
  destructive: '#EF4444',
  destructiveForeground: '#FFFFFF',
  border: '#E2E8F0',
  input: '#E2E8F0',
  ring: '#2563EB',
};

// ─── Resolver ─────────────────────────────────────────────────────────────────

function resolveColors(hslColors: TenantThemeColors): ResolvedColors {
  /**
   * TenantThemeColors stores values as "H S% L%" strings.
   * React Native StyleSheet doesn't support CSS hsl() so we convert to hex.
   */
  const c = (hsl: string) => hslToHex(hsl);

  return {
    primary: c(hslColors.primary),
    primaryForeground: '#FFFFFF',
    secondary: c(hslColors.secondary),
    secondaryForeground: '#FFFFFF',
    accent: c(hslColors.accent),
    accentForeground: '#FFFFFF',
    background: c(hslColors.background),
    surface: c(hslColors.surface),
    foreground: c(hslColors.foreground),
    mutedForeground: c(hslColors.mutedForeground),
    destructive: c(hslColors.destructive),
    destructiveForeground: '#FFFFFF',
    border: c(hslColors.border),
    input: c(hslColors.input),
    ring: c(hslColors.ring),
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue>({
  tenantTheme: null,
  colors: DEFAULT_COLORS,
  clinicName: 'EMR Vet',
  logoUrl: null,
  setTenantTheme: () => {},
  clearTenantTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tenantTheme, setTenantThemeState] = useState<TenantTheme | null>(null);
  const [colors, setColors] = useState<ResolvedColors>(DEFAULT_COLORS);

  const setTenantTheme = useCallback((theme: TenantTheme) => {
    setTenantThemeState(theme);
    setColors(resolveColors(theme.colors));
  }, []);

  const clearTenantTheme = useCallback(() => {
    setTenantThemeState(null);
    setColors(DEFAULT_COLORS);
  }, []);

  const value: ThemeContextValue = {
    tenantTheme,
    colors,
    clinicName: tenantTheme?.clinicName ?? 'EMR Vet',
    logoUrl: tenantTheme?.logoUrl ?? null,
    setTenantTheme,
    clearTenantTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
