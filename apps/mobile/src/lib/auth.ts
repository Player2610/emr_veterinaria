import * as SecureStore from 'expo-secure-store';

// ─── Key constants ────────────────────────────────────────────────────────────

const KEYS = {
  ACCESS_TOKEN: 'emr_access_token',
  REFRESH_TOKEN: 'emr_refresh_token',
  TENANT_ID: 'emr_tenant_id',
  USER_ID: 'emr_user_id',
  PUSH_TOKEN: 'emr_push_token',
} as const;

// ─── Token storage ────────────────────────────────────────────────────────────

export async function saveTokens(access: string, refresh: string): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, access),
    SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refresh),
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
  ]);
}

// ─── Tenant storage ───────────────────────────────────────────────────────────

export async function saveTenantId(tenantId: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.TENANT_ID, tenantId);
}

export async function getTenantId(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.TENANT_ID);
}

export async function clearTenantId(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.TENANT_ID);
}

// ─── User ID storage ──────────────────────────────────────────────────────────

export async function saveUserId(userId: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.USER_ID, userId);
}

export async function getUserId(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.USER_ID);
}

// ─── Push token storage ───────────────────────────────────────────────────────

export async function savePushToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.PUSH_TOKEN, token);
}

export async function getPushToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.PUSH_TOKEN);
}

// ─── Full logout (clears all persisted auth data) ────────────────────────────

export async function clearAllAuthData(): Promise<void> {
  await Promise.all(
    Object.values(KEYS).map((key) => SecureStore.deleteItemAsync(key))
  );
}

// ─── Check if user is authenticated ──────────────────────────────────────────

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}
