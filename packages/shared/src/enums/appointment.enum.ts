/**
 * Estados posibles de una cita veterinaria.
 *
 * Flujo principal:
 *   PENDING_CONFIRMATION → CONFIRMED → IN_PROGRESS → COMPLETED
 *
 * Flujos alternativos:
 *   cualquier estado → CANCELLED
 *   CONFIRMED        → NO_SHOW
 *   CONFIRMED        → RESCHEDULED → (nueva cita PENDING_CONFIRMATION)
 */
export enum AppointmentStatus {
  /** Cita creada, pendiente de confirmación por la clínica */
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  /** Confirmada por la clínica o veterinario */
  CONFIRMED = 'CONFIRMED',
  /** El paciente ha llegado y la consulta está en curso */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Consulta finalizada con éxito */
  COMPLETED = 'COMPLETED',
  /** Cancelada (por el cliente o la clínica) */
  CANCELLED = 'CANCELLED',
  /** El paciente no se presentó */
  NO_SHOW = 'NO_SHOW',
  /** Reprogramada a otra fecha/hora */
  RESCHEDULED = 'RESCHEDULED',
}

/** Tipo de cita */
export enum AppointmentType {
  /** Consulta general / chequeo rutinario */
  GENERAL_CHECKUP = 'GENERAL_CHECKUP',
  /** Vacunación */
  VACCINATION = 'VACCINATION',
  /** Cirugía */
  SURGERY = 'SURGERY',
  /** Urgencia / emergencia */
  EMERGENCY = 'EMERGENCY',
  /** Seguimiento de tratamiento */
  FOLLOW_UP = 'FOLLOW_UP',
  /** Consulta de especialidad */
  SPECIALIST = 'SPECIALIST',
  /** Grooming / estética */
  GROOMING = 'GROOMING',
  /** Consulta de laboratorio / resultados */
  LABORATORY = 'LABORATORY',
  /** Imagen diagnóstica (rayos X, ecografía) */
  IMAGING = 'IMAGING',
  /** Otro tipo no categorizado */
  OTHER = 'OTHER',
}

/** Prioridad de la cita */
export enum AppointmentPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/** Etiquetas legibles para AppointmentStatus */
export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING_CONFIRMATION]: 'Pendiente de confirmación',
  [AppointmentStatus.CONFIRMED]: 'Confirmada',
  [AppointmentStatus.IN_PROGRESS]: 'En curso',
  [AppointmentStatus.COMPLETED]: 'Completada',
  [AppointmentStatus.CANCELLED]: 'Cancelada',
  [AppointmentStatus.NO_SHOW]: 'No se presentó',
  [AppointmentStatus.RESCHEDULED]: 'Reprogramada',
};

/** Estados que indican que la cita ya no está activa */
export const TERMINAL_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELLED,
  AppointmentStatus.NO_SHOW,
];

/** Estados que permiten edición de la cita */
export const EDITABLE_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.PENDING_CONFIRMATION,
  AppointmentStatus.CONFIRMED,
];
