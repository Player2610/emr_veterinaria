import { hexToHslChannels, hslChannelsToHex } from './utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All CSS custom properties that define a tenant's visual theme.
 * Values are stored as HSL channels ("H S% L%") — no hsl() wrapper —
 * so Tailwind opacity utilities work correctly.
 */
export interface TenantTheme {
  // Core palette
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  // Semantic
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;
  // UI chrome
  border: string;
  input: string;
  ring: string;
  // Shape & typography
  radius: string;
  fontSans: string;
  fontMono: string;
  // Sidebar
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarBorder: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarMutedForeground: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS variable mapping
// ─────────────────────────────────────────────────────────────────────────────

/** Maps TenantTheme keys to CSS custom property names. */
export const THEME_CSS_VAR_MAP: Record<keyof TenantTheme, string> = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
  success: '--success',
  successForeground: '--success-foreground',
  warning: '--warning',
  warningForeground: '--warning-foreground',
  info: '--info',
  infoForeground: '--info-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
  radius: '--radius',
  fontSans: '--font-sans',
  fontMono: '--font-mono',
  sidebarBackground: '--sidebar-background',
  sidebarForeground: '--sidebar-foreground',
  sidebarBorder: '--sidebar-border',
  sidebarAccent: '--sidebar-accent',
  sidebarAccentForeground: '--sidebar-accent-foreground',
  sidebarMutedForeground: '--sidebar-muted-foreground',
};

// ─────────────────────────────────────────────────────────────────────────────
// Default theme (matches globals.css)
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_THEME: TenantTheme = {
  background: '0 0% 100%',
  foreground: '222.2 84% 4.9%',
  card: '0 0% 100%',
  cardForeground: '222.2 84% 4.9%',
  popover: '0 0% 100%',
  popoverForeground: '222.2 84% 4.9%',
  primary: '221.2 83.2% 53.3%',
  primaryForeground: '210 40% 98%',
  secondary: '210 40% 96.1%',
  secondaryForeground: '222.2 47.4% 11.2%',
  muted: '210 40% 96.1%',
  mutedForeground: '215.4 16.3% 46.9%',
  accent: '210 40% 96.1%',
  accentForeground: '222.2 47.4% 11.2%',
  destructive: '0 84.2% 60.2%',
  destructiveForeground: '210 40% 98%',
  success: '142 76% 36%',
  successForeground: '0 0% 100%',
  warning: '38 92% 50%',
  warningForeground: '0 0% 100%',
  info: '199 89% 48%',
  infoForeground: '0 0% 100%',
  border: '214.3 31.8% 91.4%',
  input: '214.3 31.8% 91.4%',
  ring: '221.2 83.2% 53.3%',
  radius: '0.5rem',
  fontSans: 'Inter',
  fontMono: 'JetBrains Mono',
  sidebarBackground: '222.2 84% 4.9%',
  sidebarForeground: '210 40% 98%',
  sidebarBorder: '217.2 32.6% 17.5%',
  sidebarAccent: '217.2 32.6% 17.5%',
  sidebarAccentForeground: '210 40% 98%',
  sidebarMutedForeground: '215.4 16.3% 56.9%',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply a TenantTheme to the document root element by setting CSS custom
 * properties. Safe to call on every render — only changed vars are written.
 */
export function applyThemeToDOM(theme: Partial<TenantTheme>): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const [key, cssVar] of Object.entries(THEME_CSS_VAR_MAP)) {
    const value = theme[key as keyof TenantTheme];
    if (value !== undefined) {
      root.style.setProperty(cssVar, value);
    }
  }
}

/**
 * Read the current CSS custom properties from the document root and return
 * them as a TenantTheme object.
 */
export function readThemeFromDOM(): TenantTheme {
  if (typeof document === 'undefined') return { ...DEFAULT_THEME };
  const root = document.documentElement;
  const theme = { ...DEFAULT_THEME };
  for (const [key, cssVar] of Object.entries(THEME_CSS_VAR_MAP)) {
    const value = root.style.getPropertyValue(cssVar).trim();
    if (value) {
      (theme as Record<string, string>)[key] = value;
    }
  }
  return theme;
}

/** Keys that represent colour channels (as opposed to radius, font names). */
export const COLOR_THEME_KEYS: (keyof TenantTheme)[] = [
  'background',
  'foreground',
  'primary',
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'accent',
  'accentForeground',
  'muted',
  'mutedForeground',
  'destructive',
  'border',
  'ring',
  'success',
  'warning',
  'info',
  'sidebarBackground',
  'sidebarAccent',
];

/** Human-readable labels for the theme editor. */
export const THEME_KEY_LABELS: Partial<Record<keyof TenantTheme, string>> = {
  background: 'Fondo',
  foreground: 'Texto principal',
  primary: 'Color primario',
  primaryForeground: 'Texto sobre primario',
  secondary: 'Color secundario',
  secondaryForeground: 'Texto sobre secundario',
  accent: 'Acento',
  muted: 'Atenuado',
  destructive: 'Destructivo / Error',
  border: 'Bordes',
  ring: 'Anillo de foco',
  success: 'Éxito',
  warning: 'Advertencia',
  info: 'Información',
  sidebarBackground: 'Fondo sidebar',
  sidebarAccent: 'Acento sidebar',
  radius: 'Radio de bordes',
  fontSans: 'Fuente principal',
};

export { hexToHslChannels, hslChannelsToHex };
