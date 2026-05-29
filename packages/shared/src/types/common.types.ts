// ─────────────────────────────────────────────────────────────────────────────
// Tipos base
// ─────────────────────────────────────────────────────────────────────────────

/** Campos de auditoría presentes en todas las entidades persistidas */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Entidad que pertenece a un tenant concreto */
export interface TenantEntity extends BaseEntity {
  tenantId: string;
}

/** Entidad que puede ser borrada de forma lógica (soft delete) */
export interface SoftDeletable {
  deletedAt: Date | null;
  isDeleted: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Respuestas de API
// ─────────────────────────────────────────────────────────────────────────────

/** Metadatos de error estructurados */
export interface ApiError {
  code: string;
  message: string;
  /** Detalles adicionales (p.ej. errores de validación por campo) */
  details?: Record<string, unknown>;
  /** Stack trace — solo en desarrollo */
  stack?: string;
}

/** Wrapper genérico para todas las respuestas de la API */
export interface ApiResponse<T = unknown> {
  data: T | null;
  meta?: Record<string, unknown>;
  error?: ApiError;
  /** Timestamp de la respuesta en ISO 8601 */
  timestamp: string;
  /** Identificador único de la request para trazabilidad */
  requestId?: string;
}

/** Helper para construir una respuesta exitosa */
export type SuccessResponse<T> = ApiResponse<T> & {
  data: T;
  error: undefined;
};

/** Helper para construir una respuesta de error */
export type ErrorResponse = ApiResponse<null> & {
  data: null;
  error: ApiError;
};

// ─────────────────────────────────────────────────────────────────────────────
// Paginación
// ─────────────────────────────────────────────────────────────────────────────

/** Parámetros de entrada para una consulta paginada */
export interface PaginationParams {
  /** Número de página, base 1 */
  page: number;
  /** Cantidad de ítems por página */
  pageSize: number;
}

/** Parámetros de entrada extendidos con ordenación */
export interface PaginationAndSortParams extends PaginationParams {
  sortBy?: string;
  sortOrder?: SortOrder;
}

/** Dirección de ordenación */
export type SortOrder = 'asc' | 'desc';

/** Metadatos de paginación incluidos en respuestas de listas */
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Respuesta paginada genérica */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades de tipo
// ─────────────────────────────────────────────────────────────────────────────

/** Hace que todas las propiedades de T sean opcionales, incluyendo anidadas */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Versión de T con fechas como strings (útil para serialización JSON) */
export type WithStringDates<T> = {
  [P in keyof T]: T[P] extends Date
    ? string
    : T[P] extends Date | null
      ? string | null
      : T[P] extends object
        ? WithStringDates<T[P]>
        : T[P];
};

/** Hace que las propiedades listadas sean requeridas en T */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Hace que las propiedades listadas sean opcionales en T */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/** ID string con branding para evitar confusiones entre IDs de distintas entidades */
export type BrandedId<TBrand extends string> = string & {
  readonly __brand: TBrand;
};

export type TenantId = BrandedId<'TenantId'>;
export type UserId = BrandedId<'UserId'>;
export type PetId = BrandedId<'PetId'>;
export type OwnerId = BrandedId<'OwnerId'>;
export type VetId = BrandedId<'VetId'>;
export type AppointmentId = BrandedId<'AppointmentId'>;
export type MedicalRecordId = BrandedId<'MedicalRecordId'>;

// ─────────────────────────────────────────────────────────────────────────────
// Filtros comunes
// ─────────────────────────────────────────────────────────────────────────────

/** Rango de fechas para filtros */
export interface DateRange {
  from: Date;
  to: Date;
}

/** Filtro de búsqueda de texto libre */
export interface SearchFilter {
  query: string;
  /** Campos en los que buscar. Si está vacío, busca en todos los indexados */
  fields?: string[];
}

/** Dirección postal */
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  /** Apartamento, piso, interior, etc. */
  additionalInfo?: string;
}

/** Número de teléfono con código de país */
export interface PhoneNumber {
  /** Código de país en formato E.164 sin '+', p.ej. '34' para España */
  countryCode: string;
  number: string;
  /** Extensión opcional */
  extension?: string;
}

/** Información de contacto genérica */
export interface ContactInfo {
  email: string;
  phone?: PhoneNumber;
  alternativePhone?: PhoneNumber;
  address?: Address;
}

// ─────────────────────────────────────────────────────────────────────────────
// Enumeraciones inline comunes
// ─────────────────────────────────────────────────────────────────────────────

/** Género biológico */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNKNOWN = 'UNKNOWN',
}

/** Estado de activación de una entidad */
export enum ActiveStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}
