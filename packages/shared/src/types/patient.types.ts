import { TenantEntity, Gender, ActiveStatus } from './common.types';
import { Species } from '../enums/species.enum';

// ─────────────────────────────────────────────────────────────────────────────
// Raza
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Raza de una especie.
 * El catálogo de razas vive en el backend; aquí solo definimos la forma del tipo.
 */
export interface Breed {
  id: string;
  species: Species;
  name: string;
  /** Nombre en inglés para búsquedas internacionales */
  nameEn?: string;
  /** Si es una raza reconocida oficialmente por algún kennel club */
  isRecognized: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Información clínica de la mascota
// ─────────────────────────────────────────────────────────────────────────────

/** Estado reproductivo del animal */
export enum ReproductiveStatus {
  INTACT = 'INTACT',
  SPAYED = 'SPAYED',        // hembra esterilizada
  NEUTERED = 'NEUTERED',    // macho castrado
  UNKNOWN = 'UNKNOWN',
}

/** Estado de salud general */
export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  UNDER_TREATMENT = 'UNDER_TREATMENT',
  CHRONIC_CONDITION = 'CHRONIC_CONDITION',
  CRITICAL = 'CRITICAL',
  DECEASED = 'DECEASED',
}

/** Tipo de identificación del animal */
export enum PetIdentificationType {
  MICROCHIP = 'MICROCHIP',
  TATTOO = 'TATTOO',
  COLLAR_TAG = 'COLLAR_TAG',
  NONE = 'NONE',
}

/** Información de identificación del animal */
export interface PetIdentification {
  type: PetIdentificationType;
  /** Número de microchip, código de tatuaje, etc. */
  value?: string;
  /** Fecha de implantación / registro */
  registeredAt?: Date;
}

/** Condición médica crónica o preexistente */
export interface ChronicCondition {
  /** Nombre de la condición */
  name: string;
  /** Diagnóstico CIE-10 o SNOMED si aplica */
  code?: string;
  /** Fecha de diagnóstico inicial */
  diagnosedAt?: Date;
  /** Notas sobre el manejo de la condición */
  managementNotes?: string;
}

/** Alergia conocida del paciente */
export interface KnownAllergy {
  /** Nombre del alérgeno (medicamento, alimento, etc.) */
  allergen: string;
  /** Tipo de reacción */
  reactionType?: string;
  /** Severidad */
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  /** Notas adicionales */
  notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Entidad Pet (Paciente)
// ─────────────────────────────────────────────────────────────────────────────

/** Paciente / mascota */
export interface Pet extends TenantEntity {
  /** ID del dueño principal */
  ownerId: string;
  /** Nombre de la mascota */
  name: string;
  species: Species;
  /** ID de la raza, null si es raza mixta o desconocida */
  breedId: string | null;
  /** Nombre de la raza en texto libre (cuando no existe en el catálogo) */
  breedNameFreeText?: string;
  gender: Gender;
  reproductiveStatus: ReproductiveStatus;
  /** Fecha de nacimiento. null si se desconoce */
  dateOfBirth: Date | null;
  /** Si la fecha de nacimiento es estimada */
  dateOfBirthIsEstimated: boolean;
  /** Color / pelaje */
  color?: string;
  /** Peso en kg */
  weightKg?: number;
  /** URL a la foto de perfil de la mascota */
  photoUrl?: string | null;
  /** Color del microchip / id visual */
  identification: PetIdentification;
  healthStatus: HealthStatus;
  status: ActiveStatus;
  /** Condiciones médicas crónicas o preexistentes */
  chronicConditions: ChronicCondition[];
  /** Alergias conocidas */
  knownAllergies: KnownAllergy[];
  /** Notas internas del equipo veterinario */
  internalNotes?: string;
  /** Notas de alerta / advertencia (se muestran en rojo en la UI) */
  alertNotes?: string;
  /** ID del veterinario responsable / de cabecera */
  primaryVetId?: string;
  /** Metadatos adicionales */
  metadata?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTOs de Pet
// ─────────────────────────────────────────────────────────────────────────────

export interface CreatePetDto {
  ownerId: string;
  name: string;
  species: Species;
  breedId?: string;
  breedNameFreeText?: string;
  gender: Gender;
  reproductiveStatus?: ReproductiveStatus;
  dateOfBirth?: Date;
  dateOfBirthIsEstimated?: boolean;
  color?: string;
  weightKg?: number;
  photoUrl?: string;
  identification?: PetIdentification;
  chronicConditions?: ChronicCondition[];
  knownAllergies?: KnownAllergy[];
  internalNotes?: string;
  alertNotes?: string;
  primaryVetId?: string;
}

export interface UpdatePetDto {
  name?: string;
  breedId?: string;
  breedNameFreeText?: string;
  gender?: Gender;
  reproductiveStatus?: ReproductiveStatus;
  dateOfBirth?: Date;
  dateOfBirthIsEstimated?: boolean;
  color?: string;
  weightKg?: number;
  photoUrl?: string | null;
  identification?: PetIdentification;
  healthStatus?: HealthStatus;
  status?: ActiveStatus;
  chronicConditions?: ChronicCondition[];
  knownAllergies?: KnownAllergy[];
  internalNotes?: string;
  alertNotes?: string;
  primaryVetId?: string | null;
}

/** Versión compacta para listas y selects */
export type PetSummary = Pick<
  Pet,
  | 'id'
  | 'name'
  | 'species'
  | 'gender'
  | 'healthStatus'
  | 'status'
  | 'ownerId'
  | 'tenantId'
  | 'photoUrl'
> & {
  breedName?: string;
  ageDescription?: string;
  ownerFullName?: string;
};
