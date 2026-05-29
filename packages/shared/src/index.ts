/**
 * @emr/shared
 *
 * Tipos, enums y utilidades compartidas entre el backend (NestJS)
 * y el frontend (Next.js) del sistema EMR Veterinaria multi-tenant.
 *
 * No contiene dependencias de runtime externas — solo TypeScript puro.
 */

// Enums (exportar primero — los tipos los referencian)
export * from './enums';

// Tipos
export * from './types';

// Utilidades
export * from './utils';
