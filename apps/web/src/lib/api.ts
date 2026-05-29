import { getAccessToken, getRefreshToken, storeTokens, clearTokens, AuthTokens } from './auth';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Skip attaching the Authorization header */
  skipAuth?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Token refresh — serialized so concurrent 401s only trigger one refresh call
// ─────────────────────────────────────────────────────────────────────────────

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshTokens(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const tenantResolution = process.env.NEXT_PUBLIC_TENANT_RESOLUTION ?? 'subdomain';
      if (tenantResolution === 'header') {
        const devTenantId = process.env.NEXT_PUBLIC_DEV_TENANT_ID;
        if (devTenantId) headers['X-Tenant-ID'] = devTenantId;
      }

      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const data = (await res.json()) as { data: AuthTokens };
      storeTokens(data.data);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function redirectToLogin(): void {
  clearTokens();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core fetch wrapper
// ─────────────────────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, skipAuth, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Resolve tenant ID
  const tenantResolution =
    process.env.NEXT_PUBLIC_TENANT_RESOLUTION ?? 'subdomain';
  if (tenantResolution === 'header') {
    const devTenantId = process.env.NEXT_PUBLIC_DEV_TENANT_ID;
    if (devTenantId) {
      headers['X-Tenant-ID'] = devTenantId;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // On 401: attempt token refresh once, then retry the original request
  if (response.status === 401 && !skipAuth && path !== '/auth/refresh' && path !== '/auth/login') {
    const refreshed = await tryRefreshTokens();
    if (!refreshed) {
      redirectToLogin();
      throw new ApiError(401, 'SESSION_EXPIRED', 'Session expired');
    }

    // Retry with the new access token
    const newToken = getAccessToken();
    if (newToken) headers['Authorization'] = `Bearer ${newToken}`;
    const retryResponse = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (retryResponse.status === 401) {
      redirectToLogin();
      throw new ApiError(401, 'SESSION_EXPIRED', 'Session expired');
    }

    if (!retryResponse.ok) {
      let errorBody: { error?: { code?: string; message?: string | string[]; details?: Record<string, unknown> } } = {};
      try { errorBody = await retryResponse.json(); } catch { /* ignore */ }
      const retryMsg = Array.isArray(errorBody.error?.message)
        ? errorBody.error.message[0]
        : (errorBody.error?.message ?? retryResponse.statusText);
      throw new ApiError(retryResponse.status, errorBody.error?.code ?? 'UNKNOWN_ERROR', retryMsg, errorBody.error?.details);
    }

    if (retryResponse.status === 204) return undefined as T;
    const retryJson = await retryResponse.json() as { data: T };
    return retryJson.data;
  }

  if (!response.ok) {
    let errorBody: { error?: { code?: string; message?: string | string[]; details?: Record<string, unknown> } } = {};
    try {
      errorBody = await response.json();
    } catch {
      // ignore parse error
    }
    const message = Array.isArray(errorBody.error?.message)
      ? errorBody.error.message[0]
      : (errorBody.error?.message ?? response.statusText);
    throw new ApiError(
      response.status,
      errorBody.error?.code ?? 'UNKNOWN_ERROR',
      message,
      errorBody.error?.details,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json() as { data: T };
  return json.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP method shortcuts
// ─────────────────────────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
