'use client';

import { useContext } from 'react';
import { ThemeContext } from '@/components/theme/theme-provider';
import type { TenantTheme } from '@/lib/theme';

/**
 * Access and mutate the active tenant theme at runtime.
 *
 * @example
 * const { theme, updateTheme, resetTheme } = useTheme();
 * updateTheme({ primary: '142 76% 36%' }); // live green primary
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return {
    theme: ctx.theme,
    updateTheme: ctx.updateTheme,
    resetTheme: ctx.resetTheme,
    isDirty: ctx.isDirty,
  };
}

export type { TenantTheme };
