'use client';

import { useContext } from 'react';
import { ThemeContext } from '@/components/theme/theme-provider';

/**
 * Returns tenant metadata and theme from the nearest ThemeProvider.
 * Use this hook anywhere you need the current tenant's identity.
 */
export function useTenant() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTenant must be used inside <ThemeProvider>');
  }
  return {
    tenantId: ctx.tenantId,
    tenantName: ctx.tenantName,
    logoUrl: ctx.logoUrl,
  };
}
