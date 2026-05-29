'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Auth helpers — thin wrappers around the JWT stored in localStorage.
// In production you would use httpOnly cookies; this simplified version
// is intentional for the scaffold so it runs without a backend.
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'emr_access_token';
const REFRESH_KEY = 'emr_refresh_token';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
  iat: number;
  exp: number;
}

export function storeTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/** Decode the JWT payload without verification (client-side only). */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

export function getCurrentUser(): JwtPayload | null {
  const token = getAccessToken();
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload) return null;
  // Check expiry
  if (payload.exp * 1000 < Date.now()) {
    clearTokens();
    return null;
  }
  return payload;
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
