import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import {
  saveTokens,
  saveTenantId,
  saveUserId,
  clearAllAuthData,
  isAuthenticated,
} from '@/lib/auth';
import {
  loginRequest,
  registerRequest,
  resolveInviteCode,
  type LoginResponse,
  type ResolveInviteResponse,
} from '@/lib/api';
import { setupPushNotifications } from '@/lib/notifications';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  tenantId: string;
}

interface LoginFields {
  email: string;
  password: string;
}

interface RegisterFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthResponse = useCallback(async (response: LoginResponse) => {
    await saveTokens(response.accessToken, response.refreshToken);
    await saveTenantId(response.user.tenantId);
    await saveUserId(response.user.id);

    setUser({
      ...response.user,
      fullName: `${response.user.firstName} ${response.user.lastName}`,
    });

    // Register push token in background — non-blocking
    setupPushNotifications().catch(() => {});
  }, []);

  const login = useCallback(
    async (fields: LoginFields) => {
      setLoading(true);
      setError(null);
      try {
        const res = await loginRequest(fields.email, fields.password);
        await handleAuthResponse(res);
        router.replace('/(tabs)/');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al iniciar sesión';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [handleAuthResponse]
  );

  const register = useCallback(
    async (fields: RegisterFields) => {
      setLoading(true);
      setError(null);
      try {
        const res = await registerRequest(fields);
        await handleAuthResponse(res);
        router.replace('/(tabs)/');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al registrarse';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [handleAuthResponse]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await clearAllAuthData();
      setUser(null);
      router.replace('/(auth)/login');
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveInvite = useCallback(
    async (code: string): Promise<ResolveInviteResponse> => {
      setLoading(true);
      setError(null);
      try {
        const res = await resolveInviteCode(code);
        await saveTenantId(res.tenantId);
        return res;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Código de invitación inválido';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const checkAuth = useCallback(async (): Promise<boolean> => {
    return isAuthenticated();
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resolveInvite,
    checkAuth,
    clearError: () => setError(null),
  };
}
