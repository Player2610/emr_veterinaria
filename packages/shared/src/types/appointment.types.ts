import { TenantEntity } from './common.types';
import {
  AppointmentStatus,
  AppointmentType,
  AppointmentPriority,
} from '../enums/appointment.enum';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-tipos
// ─────────────────────────────────────────────────────────────────────────────

/** Nota/comentario de seguimiento sobre una cita */
export interface AppointmentNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  /** Si la nota es visible para el dueño en el portal */
  isVisibleToOwner: boolean;
}

/** Resultado/resumen de la consulta (rellenable durante o después) */
export interface AppointmentOutcome {
  /** Motivo principal de la visita (tal como lo describe el dueño) */
  chiefComplaint?: string;
  /** Resumen de hallazgos clínicos */
  clinicalFindings?: string;
  /** Conclusión general de la consulta */
  summary?: string;
  /** Si se generó un historial clínico (Medical Record) */
  medicalRecordId?: string;
  /** Si se requiere seguimiento */
  requiresFollowUp: boolean;
  /** Fecha recomendada para el seguimiento */
  followUpDate?: Date;
  /** Instrucciones para el dueño */
  ownerInstructions?: string;
}

/** Datos del recordatorio enviado */
export interface AppointmentReminder {
  sentAt: Date;
  channel: 'email' | 'sms' | 'push';
  status: 'sent' | 'delivered' | 'failed';
}

// ─────────────────────────────────────────────────────────────────────────────
// Entidad Appointment
// ─────────────────────────────────────────────────────────────────────────────

/** Cita veterinaria */
export interface Appointment extends TenantEntity {
  /** ID del paciente (mascota) */
  petId: string;
  /** ID del dueño */
  ownerId: string;
  /** ID del veterinario asignado */
  vetId: string;
  type: AppointmentType;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  /** Fecha y hora de inicio de la cita */
  scheduledAt: Date;
  /** Duración en minutos */
  durationMinutes: number;
  /** Fecha y hora de fin calculada (scheduledAt + durationMinutes) */
  scheduledEndAt: Date;
  /** ID de la sala/consulta asignada */
  roomId?: string;
  /** Motivo de la cita (según el dueño al pedir cita) */
  reasonForVisit: string;
  /** Síntomas reportados por el dueño */
  symptoms?: string;
  notes: AppointmentNote[];
  outcome?: AppointmentOutcome;
  reminders: AppointmentReminder[];
  /** Si fue creada desde el portal de clientes */
  createdByOwnerId?: string;
  /** Si fue creada manualmente por staff */
  createdByStaffId?: string;
  /** ID de la cita original (si es reprogramación) */
  rescheduledFromId?: string;
  /** Motivo de cancelación */
  cancellationReason?: string;
  /** ID del usuario que canceló */
  cancelledByUserId?: string;
  /** Fecha real de inicio (cuando el vet hace check-in) */
  actualStartAt?: Date;
  /** Fecha real de fin */
  actualEndAt?: Date;
  /** Metadatos adicionales */
  metadata?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTOs de Appointment
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateAppointmentDto {
  petId: string;
  ownerId: string;
  vetId: string;
  type: AppointmentType;
  priority?: AppointmentPriority;
  scheduledAt: Date;
  durationMinutes?: number;
  roomId?: string;
  reasonForVisit: string;
  symptoms?: string;
}

export interface UpdateAppointmentDto {
  vetId?: string;
  type?: AppointmentType;
  priority?: AppointmentPriority;
  scheduledAt?: Date;
  durationMinutes?: number;
  roomId?: string;
  reasonForVisit?: string;
  symptoms?: string;
}

export interface CancelAppointmentDto {
  cancellationReason: string;
}

export interface RescheduleAppointmentDto {
  scheduledAt: Date;
  durationMinutes?: number;
  vetId?: string;
  reason?: string;
}

export interface CompleteAppointmentDto {
  outcome: AppointmentOutcome;
}

/** Slot disponible para reservar cita */
export interface AvailableSlot {
  vetId: string;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  roomId?: string;
}

/** Parámetros para buscar slots disponibles */
export interface GetAvailableSlotsParams {
  vetId?: string;
  date: Date;
  appointmentType?: AppointmentType;
  durationMinutes?: number;
}

/** Versión compacta para calendario y listas */
export type AppointmentSummary = Pick<
  Appointment,
  | 'id'
  | 'petId'
  | 'ownerId'
  | 'vetId'
  | 'type'
  | 'status'
  | 'priority'
  | 'scheduledAt'
  | 'scheduledEndAt'
  | 'durationMinutes'
  | 'reasonForVisit'
  | 'tenantId'
> & {
  petName?: string;
  ownerFullName?: string;
  vetFullName?: string;
};

/** Vista de calendario — colección de citas para un rango de fechas */
export interface AppointmentCalendarView {
  vetId?: string;
  from: Date;
  to: Date;
  appointments: AppointmentSummary[];
  availableSlots?: AvailableSlot[];
}
