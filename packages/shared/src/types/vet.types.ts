import { TenantEntity, ActiveStatus, ContactInfo } from './common.types';
import { Species } from '../enums/species.enum';

// ─────────────────────────────────────────────────────────────────────────────
// Especialidades veterinarias
// ─────────────────────────────────────────────────────────────────────────────

export enum VetSpecialty {
  /** Medicina general / clínica general */
  GENERAL_PRACTICE = 'GENERAL_PRACTICE',
  /** Medicina interna */
  INTERNAL_MEDICINE = 'INTERNAL_MEDICINE',
  /** Cirugía */
  SURGERY = 'SURGERY',
  /** Dermatología */
  DERMATOLOGY = 'DERMATOLOGY',
  /** Oftalmología */
  OPHTHALMOLOGY = 'OPHTHALMOLOGY',
  /** Cardiología */
  CARDIOLOGY = 'CARDIOLOGY',
  /** Neurología */
  NEUROLOGY = 'NEUROLOGY',
  /** Oncología */
  ONCOLOGY = 'ONCOLOGY',
  /** Odontología / estomatología */
  DENTISTRY = 'DENTISTRY',
  /** Ortopedia / traumatología */
  ORTHOPEDICS = 'ORTHOPEDICS',
  /** Urgencias y cuidados intensivos */
  EMERGENCY_CRITICAL_CARE = 'EMERGENCY_CRITICAL_CARE',
  /** Animales exóticos */
  EXOTIC_ANIMALS = 'EXOTIC_ANIMALS',
  /** Grandes animales / équidos */
  LARGE_ANIMALS = 'LARGE_ANIMALS',
  /** Animales de granja / bovinos */
  FARM_ANIMALS = 'FARM_ANIMALS',
  /** Etología / comportamiento animal */
  BEHAVIOR = 'BEHAVIOR',
  /** Radiología / imagen diagnóstica */
  RADIOLOGY = 'RADIOLOGY',
  /** Anestesiología */
  ANESTHESIOLOGY = 'ANESTHESIOLOGY',
  /** Patología clínica / laboratorio */
  CLINICAL_PATHOLOGY = 'CLINICAL_PATHOLOGY',
  /** Reproducción / teriogenología */
  REPRODUCTION = 'REPRODUCTION',
  /** Nutrición clínica */
  NUTRITION = 'NUTRITION',
  /** Fisioterapia / rehabilitación */
  REHABILITATION = 'REHABILITATION',
  OTHER = 'OTHER',
}

/** Certificación / título profesional del veterinario */
export interface VetCertification {
  name: string;
  issuingOrganization: string;
  issuedAt?: Date;
  expiresAt?: Date | null;
  /** URL al documento/certificado */
  documentUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Disponibilidad del veterinario
// ─────────────────────────────────────────────────────────────────────────────

import { DayOfWeek } from './tenant.types';

/** Bloque horario de disponibilidad de un veterinario */
export interface VetAvailabilityBlock {
  dayOfWeek: DayOfWeek;
  /** Hora de inicio en formato HH:mm (24 h) */
  startTime: string;
  /** Hora de fin en formato HH:mm (24 h) */
  endTime: string;
  /** ID de la sucursal/sede donde atiende en este bloque */
  locationId?: string;
}

/** Excepción puntual de disponibilidad (vacaciones, ausencias, etc.) */
export interface VetAvailabilityException {
  date: Date;
  /** Si es un día completamente no disponible */
  isFullDayOff: boolean;
  /** Motivo (visible internamente) */
  reason?: string;
  /** Bloques de disponibilidad alternativos para ese día (anula la config semanal) */
  customBlocks?: Array<{ startTime: string; endTime: string }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Entidad Veterinarian
// ─────────────────────────────────────────────────────────────────────────────

/** Perfil profesional del veterinario */
export interface Veterinarian extends TenantEntity {
  /** Referencia al User del sistema */
  userId: string;
  /** Número de colegiado / licencia profesional */
  licenseNumber: string;
  /** País/organismo que emitió la licencia */
  licenseIssuingAuthority?: string;
  /** Fecha de expiración de la licencia */
  licenseExpiresAt?: Date | null;
  firstName: string;
  lastName: string;
  /** Título académico, p.ej. 'MVZ', 'DVM', 'Dr.' */
  title?: string;
  contactInfo?: ContactInfo;
  /** Foto de perfil profesional */
  photoUrl?: string | null;
  /** Breve biografía / descripción para el portal de clientes */
  bio?: string;
  specialties: VetSpecialty[];
  /** Especies que trata principalmente */
  treatedSpecies: Species[];
  certifications: VetCertification[];
  availabilityBlocks: VetAvailabilityBlock[];
  availabilityExceptions: VetAvailabilityException[];
  status: ActiveStatus;
  /** Duración por defecto de sus consultas en minutos (sobreescribe la del tenant) */
  defaultAppointmentDurationMinutes?: number;
  /** Color para mostrar en el calendario */
  calendarColor?: string;
  /** Si acepta nuevos pacientes */
  acceptingNewPatients: boolean;
  /** Idiomas que habla */
  languages: string[];
  /** Metadatos adicionales */
  metadata?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTOs de Veterinarian
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateVeterinarianDto {
  userId: string;
  licenseNumber: string;
  licenseIssuingAuthority?: string;
  licenseExpiresAt?: Date;
  firstName: string;
  lastName: string;
  title?: string;
  contactInfo?: ContactInfo;
  photoUrl?: string;
  bio?: string;
  specialties?: VetSpecialty[];
  treatedSpecies?: Species[];
  certifications?: VetCertification[];
  defaultAppointmentDurationMinutes?: number;
  calendarColor?: string;
  acceptingNewPatients?: boolean;
  languages?: string[];
}

export interface UpdateVeterinarianDto {
  licenseNumber?: string;
  licenseIssuingAuthority?: string;
  licenseExpiresAt?: Date | null;
  firstName?: string;
  lastName?: string;
  title?: string;
  contactInfo?: ContactInfo;
  photoUrl?: string | null;
  bio?: string;
  specialties?: VetSpecialty[];
  treatedSpecies?: Species[];
  certifications?: VetCertification[];
  availabilityBlocks?: VetAvailabilityBlock[];
  status?: ActiveStatus;
  defaultAppointmentDurationMinutes?: number;
  calendarColor?: string;
  acceptingNewPatients?: boolean;
  languages?: string[];
}

/** Versión compacta para listas, calendarios y selects */
export type VetSummary = Pick<
  Veterinarian,
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'title'
  | 'specialties'
  | 'status'
  | 'photoUrl'
  | 'calendarColor'
  | 'acceptingNewPatients'
  | 'tenantId'
>;
