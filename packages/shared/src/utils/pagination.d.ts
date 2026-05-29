import type { PaginationMeta, PaginationParams, PaginatedResponse, ApiResponse, ApiError } from '../types/common.types';
export declare const DEFAULT_PAGE = 1;
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 100;
/**
 * Calcula los metadatos de paginación a partir de total, página y tamaño.
 *
 * @example
 * const meta = createPaginationMeta(100, 2, 20);
 * // { total: 100, page: 2, pageSize: 20, totalPages: 5,
 * //   hasNextPage: true, hasPreviousPage: true }
 */
export declare function createPaginationMeta(total: number, page: number, pageSize: number): PaginationMeta;
/**
 * Construye una respuesta paginada genérica.
 *
 * @example
 * const response = createPaginatedResponse(items, 100, { page: 2, pageSize: 20 });
 */
export declare function createPaginatedResponse<T>(items: T[], total: number, params: PaginationParams): PaginatedResponse<T>;
/**
 * Calcula el offset (skip) para una query a base de datos.
 *
 * @example
 * const offset = getOffset(2, 20); // 20
 */
export declare function getOffset(page: number, pageSize: number): number;
/**
 * Normaliza y valida los parámetros de paginación entrantes.
 * Aplica defaults y cotas máximas/mínimas.
 */
export declare function normalizePaginationParams(rawPage?: unknown, rawPageSize?: unknown): PaginationParams;
/**
 * Construye un ApiResponse exitoso.
 *
 * @example
 * return createSuccessResponse(user, { requestId: '123' });
 */
export declare function createSuccessResponse<T>(data: T, options?: {
    meta?: Record<string, unknown>;
    requestId?: string;
}): ApiResponse<T>;
/**
 * Construye un ApiResponse de error.
 *
 * @example
 * return createErrorResponse('NOT_FOUND', 'Pet not found', { requestId: '123' });
 */
export declare function createErrorResponse(code: string, message: string, options?: {
    details?: Record<string, unknown>;
    requestId?: string;
    stack?: string;
}): ApiResponse<null>;
/**
 * Construye un ApiResponse paginado (envuelve la respuesta paginada en ApiResponse).
 */
export declare function createPaginatedApiResponse<T>(items: T[], total: number, params: PaginationParams, options?: {
    requestId?: string;
    extraMeta?: Record<string, unknown>;
}): ApiResponse<PaginatedResponse<T>>;
/** Verifica si un ApiResponse contiene datos (no es un error) */
export declare function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & {
    data: T;
};
/** Verifica si un ApiResponse es un error */
export declare function isErrorResponse(response: ApiResponse<unknown>): response is ApiResponse<null> & {
    error: ApiError;
};
//# sourceMappingURL=pagination.d.ts.map