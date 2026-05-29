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
export declare enum AppointmentStatus {
    /** Cita creada, pendiente de confirmación por la clínica */
    PENDING_CONFIRMATION = "PENDING_CONFIRMATION",
    /** Confirmada por la clínica o veterinario */
    CONFIRMED = "CONFIRMED",
    /** El paciente ha llegado y la consulta está en curso */
    IN_PROGRESS = "IN_PROGRESS",
    /** Consulta finalizada con éxito */
    COMPLETED = "COMPLETED",
    /** Cancelada (por el cliente o la clínica) */
    CANCELLED = "CANCELLED",
    /** El paciente no se presentó */
    NO_SHOW = "NO_SHOW",
    /** Reprogramada a otra fecha/hora */
    RESCHEDULED = "RESCHEDULED"
}
/** Tipo de cita */
export declare enum AppointmentType {
    /** Consulta general / chequeo rutinario */
    GENERAL_CHECKUP = "GENERAL_CHECKUP",
    /** Vacunación */
    VACCINATION = "VACCINATION",
    /** Cirugía */
    SURGERY = "SURGERY",
    /** Urgencia / emergencia */
    EMERGENCY = "EMERGENCY",
    /** Seguimiento de tratamiento */
    FOLLOW_UP = "FOLLOW_UP",
    /** Consulta de especialidad */
    SPECIALIST = "SPECIALIST",
    /** Grooming / estética */
    GROOMING = "GROOMING",
    /** Consulta de laboratorio / resultados */
    LABORATORY = "LABORATORY",
    /** Imagen diagnóstica (rayos X, ecografía) */
    IMAGING = "IMAGING",
    /** Otro tipo no categorizado */
    OTHER = "OTHER"
}
/** Prioridad de la cita */
export declare enum AppointmentPriority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
/** Etiquetas legibles para AppointmentStatus */
export declare const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string>;
/** Estados que indican que la cita ya no está activa */
export declare const TERMINAL_APPOINTMENT_STATUSES: AppointmentStatus[];
/** Estados que permiten edición de la cita */
export declare const EDITABLE_APPOINTMENT_STATUSES: AppointmentStatus[];
//# sourceMappingURL=appointment.enum.d.ts.map