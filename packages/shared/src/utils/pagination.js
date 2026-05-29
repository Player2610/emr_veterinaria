"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.DEFAULT_PAGE = void 0;
exports.createPaginationMeta = createPaginationMeta;
exports.createPaginatedResponse = createPaginatedResponse;
exports.getOffset = getOffset;
exports.normalizePaginationParams = normalizePaginationParams;
exports.createSuccessResponse = createSuccessResponse;
exports.createErrorResponse = createErrorResponse;
exports.createPaginatedApiResponse = createPaginatedApiResponse;
exports.isSuccessResponse = isSuccessResponse;
exports.isErrorResponse = isErrorResponse;
// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────
exports.DEFAULT_PAGE = 1;
exports.DEFAULT_PAGE_SIZE = 20;
exports.MAX_PAGE_SIZE = 100;
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
function createPaginationMeta(total, page, pageSize) {
    const safePageSize = Math.min(Math.max(pageSize, 1), exports.MAX_PAGE_SIZE);
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
function createPaginatedResponse(items, total, params) {
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
function getOffset(page, pageSize) {
    return (Math.max(page, 1) - 1) * Math.min(Math.max(pageSize, 1), exports.MAX_PAGE_SIZE);
}
/**
 * Normaliza y valida los parámetros de paginación entrantes.
 * Aplica defaults y cotas máximas/mínimas.
 */
function normalizePaginationParams(rawPage, rawPageSize) {
    const page = Number(rawPage);
    const pageSize = Number(rawPageSize);
    return {
        page: Number.isFinite(page) && page > 0 ? Math.floor(page) : exports.DEFAULT_PAGE,
        pageSize: Number.isFinite(pageSize) && pageSize > 0
            ? Math.min(Math.floor(pageSize), exports.MAX_PAGE_SIZE)
            : exports.DEFAULT_PAGE_SIZE,
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
function createSuccessResponse(data, options) {
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
function createErrorResponse(code, message, options) {
    const error = {
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
function createPaginatedApiResponse(items, total, params, options) {
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
function isSuccessResponse(response) {
    return response.data !== null && !response.error;
}
/** Verifica si un ApiResponse es un error */
function isErrorResponse(response) {
    return !!response.error;
}
//# sourceMappingURL=pagination.js.map