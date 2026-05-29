'use client';

import { useMemo } from 'react';
import { type TenantTheme, THEME_CSS_VAR_MAP } from '@/lib/theme';

interface CssVarsInjectorProps {
  theme: TenantTheme;
}

/**
 * Injects CSS custom properties into :root via a <style> tag.
 * This works on both server (SSR) and client and ensures no flash of
 * unstyled content between the server render and client hydration.
 */
export function CssVarsInjector({ theme }: CssVarsInjectorProps) {
  const css = useMemo(() => {
    const declarations = Object.entries(THEME_CSS_VAR_MAP)
      .map(([key, cssVar]) => {
        const value = theme[key as keyof TenantTheme];
        return value !== undefined ? `  ${cssVar}: ${value};` : null;
      })
      .filter(Boolean)
      .join('\n');

    return `:root {\n${declarations}\n}`;
  }, [theme]);

  return (
    <style
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: css }}
      data-emr-theme="true"
    />
  );
}
