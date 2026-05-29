import { TenantEntity, ActiveStatus, ContactInfo, Address } from './common.types';

// ─────────────────────────────────────────────────────────────────────────────
// Entidad Owner (dueño de mascota / cliente de la clínica)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Propietario/tutor de uno o más pacientes.
 * Puede tener o no un User asociado (cuenta en el portal de clientes).
 */
export interface Owner extends TenantEntity {
  /** ID del User si tiene acceso al portal de clientes */
  userId?: string | null;
  firstName: string;
  lastName: string;
  /** Número de identificación (DNI, pasaporte, RFC, etc.) */
  nationalId?: string;
  contactInfo: ContactInfo;
  address?: Address;
  status: ActiveStatus;
  /** Notas internas sobre el dueño (no visibles en el portal) */
  internalNotes?: string;
  /** Número de pacientes activos asociados */
  activePetCount?: number;
  /** Etiquetas / categorías para clasificar el cliente */
  tags?: string[];
  /** Preferencia de comunicación */
  preferredContactMethod: ContactMethod;
  /** Si acepta comunicaciones de marketing */
  marketingConsent: boolean;
  /** Fecha de aceptación de términos y privacidad */
  termsAcceptedAt?: Date;
  /** Metadatos adicionales libres */
  metadata?: Record<string, unknown>;
}

/** Canal de contacto preferido */
export enum ContactMethod {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PHONE_CALL = 'PHONE_CALL',
  WHATSAPP = 'WHATSAPP',
}

// ─────────────────────────────────────────────────────────────────────────────
// DTOs de Owner
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateOwnerDto {
  firstName: string;
  lastName: string;
  nationalId?: string;
  contactInfo: ContactInfo;
  address?: Address;
  preferredContactMethod?: ContactMethod;
  marketingConsent?: boolean;
  internalNotes?: string;
  tags?: string[];
  /** Vincular a un User existente */
  userId?: string;
}

export interface UpdateOwnerDto {
  firstName?: string;
  lastName?: string;
  nationalId?: string;
  contactInfo?: Partial<ContactInfo>;
  address?: Address;
  status?: ActiveStatus;
  preferredContactMethod?: ContactMethod;
  marketingConsent?: boolean;
  internalNotes?: string;
  tags?: string[];
}

/** Versión compacta para mostrar en listas y selects */
export type OwnerSummary = Pick<
  Owner,
  'id' | 'firstName' | 'lastName' | 'tenantId' | 'status'
> & {
  fullName: string;
  email: string;
  phone?: string;
  activePetCount: number;
};
