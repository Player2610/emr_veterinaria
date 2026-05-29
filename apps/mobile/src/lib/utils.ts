import { Species, SPECIES_LABELS } from '@emr/shared';

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Returns a human-readable relative age string.
 * e.g. "2 años", "8 meses", "3 semanas"
 */
export function getAgeDescription(dateOfBirth: Date | string | null | undefined): string {
  if (!dateOfBirth) return 'Edad desconocida';

  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const now = new Date();

  const diffMs = now.getTime() - dob.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) return 'Edad desconocida';
  if (days < 30) return `${days} día${days !== 1 ? 's' : ''}`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mes${months !== 1 ? 'es' : ''}`;

  const years = Math.floor(months / 12);
  const remMonths = months % 12;

  if (remMonths === 0) return `${years} año${years !== 1 ? 's' : ''}`;
  return `${years} año${years !== 1 ? 's' : ''} y ${remMonths} mes${remMonths !== 1 ? 'es' : ''}`;
}

/**
 * Format a Date to a localized short date string.
 * e.g. "15 ene. 2024"
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a Date to time string.
 * e.g. "14:30"
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format date+time together.
 * e.g. "15 ene. 2024, 14:30"
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  return `${formatDate(date)}, ${formatTime(date)}`;
}

/**
 * Returns true if date is today.
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

/**
 * Returns true if date is in the future.
 */
export function isFuture(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() > Date.now();
}

// ─── Species helpers ──────────────────────────────────────────────────────────

export function getSpeciesEmoji(species: Species): string {
  const map: Partial<Record<Species, string>> = {
    [Species.DOG]: '🐶',
    [Species.CAT]: '🐱',
    [Species.RABBIT]: '🐰',
    [Species.BIRD]: '🐦',
    [Species.HAMSTER]: '🐹',
    [Species.GUINEA_PIG]: '🐾',
    [Species.LIZARD]: '🦎',
    [Species.SNAKE]: '🐍',
    [Species.TURTLE]: '🐢',
    [Species.FISH]: '🐟',
    [Species.HORSE]: '🐴',
    [Species.FERRET]: '🦡',
  };
  return map[species] ?? '🐾';
}

export function getSpeciesLabel(species: Species): string {
  return SPECIES_LABELS[species] ?? species;
}

// ─── String helpers ───────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formats a weight value with unit.
 * e.g. formatWeight(3.5) → "3.5 kg"
 */
export function formatWeight(kg: number | null | undefined): string {
  if (kg == null) return '-';
  return `${kg.toFixed(1)} kg`;
}

// ─── Validation helpers ───────────────────────────────────────────────────────

/** Validates an 8-character alphanumeric invite code */
export function isValidInviteCode(code: string): boolean {
  return /^[A-Z0-9]{8}$/i.test(code.trim());
}

// ─── HSL color parser (for TenantTheme) ──────────────────────────────────────

/**
 * Converts an HSL string "H S% L%" to a React Native color string.
 * e.g. "220 90% 56%" → "hsl(220, 90%, 56%)"
 *
 * Note: React Native doesn't support CSS hsl() directly — use this
 * to convert to rgb hex for RN StyleSheet usage.
 */
export function hslToHex(hsl: string): string {
  // Parse "H S% L%" format
  const parts = hsl.trim().split(/\s+/);
  if (parts.length < 3) return '#000000';

  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
