import type {
  PaginationMeta,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
  ApiError,
} from '../types/common.types';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ─────────────────────────────────────────────────────────────────────────────
// Paginación
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula los metadatos de paginación a partir de total, página y tamaño.
 *
 * @example
 * const meta = createPaginationMeta(100, 2, 20);
 * // { total: 100, page: 2, pageSize: 20, totalPages: 5,
 * //   hasNextPage: true, hasPreviousPage: true }
 */
export function createPaginationMeta(
  total: number,
  page: number,
  pageSize: number,
): PaginationMeta {
  const safePageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const totalPages = Math.ceil(total / safePageSize);
  const safePage = Math.min(Math.max(page, 1), totalPages || 1);

  return {
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}

/**
 * Construye una respuesta paginada genérica.
 *
 * @example
 * const response = createPaginatedResponse(items, 100, { page: 2, pageSize: 20 });
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  params: PaginationParams,
): PaginatedResponse<T> {
  const meta = createPaginationMeta(total, params.page, params.pageSize);
  return {
    items,
    ...meta,
  };
}

/**
 * Calcula el offset (skip) para una query a base de datos.
 *
 * @example
 * const offset = getOffset(2, 20); // 20
 */
export function getOffset(page: number, pageSize: number): number {
  return (Math.max(page, 1) - 1) * Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
}

/**
 * Normaliza y valida los parámetros de paginación entrantes.
 * Aplica defaults y cotas máximas/mínimas.
 */
export function normalizePaginationParams(
  rawPage?: unknown,
  rawPageSize?: unknown,
): PaginationParams {
  const page = Number(rawPage);
  const pageSize = Number(rawPageSize);

  return {
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : DEFAULT_PAGE,
    pageSize:
      Number.isFinite(pageSize) && pageSize > 0
        ? Math.min(Math.floor(pageSize), MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response builders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construye un ApiResponse exitoso.
 *
 * @example
 * return createSuccessResponse(user, { requestId: '123' });
 */
export function createSuccessResponse<T>(
  data: T,
  options?: {
    meta?: Record<string, unknown>;
    requestId?: string;
  },
): ApiResponse<T> {
  return {
    data,
    meta: options?.meta,
    timestamp: new Date().toISOString(),
    requestId: options?.requestId,
  };
}

/**
 * Construye un ApiResponse de error.
 *
 * @example
 * return createErrorResponse('NOT_FOUND', 'Pet not found', { requestId: '123' });
 */
export function createErrorResponse(
  code: string,
  message: string,
  options?: {
    details?: Record<string, unknown>;
    requestId?: string;
    stack?: string;
  },
): ApiResponse<null> {
  const error: ApiError = {
    code,
    message,
    details: options?.details,
    stack: options?.stack,
  };

  return {
    data: null,
    error,
    timestamp: new Date().toISOString(),
    requestId: options?.requestId,
  };
}

/**
 * Construye un ApiResponse paginado (envuelve la respuesta paginada en ApiResponse).
 */
export function createPaginatedApiResponse<T>(
  items: T[],
  total: number,
  params: PaginationParams,
  options?: {
    requestId?: string;
    extraMeta?: Record<string, unknown>;
  },
): ApiResponse<PaginatedResponse<T>> {
  const paginatedData = createPaginatedResponse(items, total, params);
  const paginationMeta = createPaginationMeta(total, params.page, params.pageSize);

  return createSuccessResponse(paginatedData, {
    meta: { ...paginationMeta, ...options?.extraMeta },
    requestId: options?.requestId,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Type guards
// ─────────────────────────────────────────────────────────────────────────────

/** Verifica si un ApiResponse contiene datos (no es un error) */
export function isSuccessResponse<T>(
  response: ApiResponse<T>,
): response is ApiResponse<T> & { data: T } {
  return response.data !== null && !response.error;
}

/** Verifica si un ApiResponse es un error */
export function isErrorResponse(
  response: ApiResponse<unknown>,
): response is ApiResponse<null> & { error: ApiError } {
  return !!response.error;
}
