import { getAccessToken, getRefreshToken, getTenantId, saveTokens, clearAllAuthData } from './auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export class ApiRequestError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

// ─── Refresh token logic ──────────────────────────────────────────────────────

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new ApiRequestError(401, 'No refresh token available');

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await clearAllAuthData();
    throw new ApiRequestError(401, 'Session expired. Please log in again.');
  }

  const json = await res.json() as { accessToken: string; refreshToken: string };
  await saveTokens(json.accessToken, json.refreshToken);
  return json.accessToken;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function buildHeaders(extra?: HeadersInit): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...extra as Record<string, string>,
  };

  const [accessToken, tenantId] = await Promise.all([
    getAccessToken(),
    getTenantId(),
  ]);

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  if (tenantId) {
    headers['x-tenant-id'] = tenantId;
  }

  return headers;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retried = false
): Promise<T> {
  const headers = await buildHeaders();
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  // Handle 401 — attempt token refresh once
  if (res.status === 401 && !retried) {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        pendingRequests.push((newToken) => {
          request<T>(method, path, body, true).then(resolve).catch(reject);
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      pendingRequests.forEach((cb) => cb(newToken));
      pendingRequests = [];
      return request<T>(method, path, body, true);
    } finally {
      isRefreshing = false;
    }
  }

  if (!res.ok) {
    let errorBody: ApiError | undefined;
    try {
      errorBody = await res.json() as ApiError;
    } catch {
      // ignore parse error
    }
    throw new ApiRequestError(
      res.status,
      errorBody?.message ?? `Request failed with status ${res.status}`,
      errorBody
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Public API surface ───────────────────────────────────────────────────────

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>('GET', path);
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('POST', path, body);
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('PATCH', path, body);
  },
  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('PUT', path, body);
  },
  delete<T>(path: string): Promise<T> {
    return request<T>('DELETE', path);
  },
};

// ─── Auth-specific helpers ────────────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    tenantId: string;
  };
}

export interface ResolveInviteResponse {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
}

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/owner/login', { email, password });
}

export async function registerRequest(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/owner/register', data);
}

export async function resolveInviteCode(code: string): Promise<ResolveInviteResponse> {
  return api.post<ResolveInviteResponse>('/auth/invite/resolve', { code });
}

export async function registerPushToken(pushToken: string): Promise<void> {
  return api.post('/notifications/device-token', { token: pushToken, platform: 'expo' });
}
