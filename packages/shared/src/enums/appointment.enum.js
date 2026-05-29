"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EDITABLE_APPOINTMENT_STATUSES = exports.TERMINAL_APPOINTMENT_STATUSES = exports.APPOINTMENT_STATUS_LABELS = exports.AppointmentPriority = exports.AppointmentType = exports.AppointmentStatus = void 0;
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
var AppointmentStatus;
(function (AppointmentStatus) {
    /** Cita creada, pendiente de confirmación por la clínica */
    AppointmentStatus["PENDING_CONFIRMATION"] = "PENDING_CONFIRMATION";
    /** Confirmada por la clínica o veterinario */
    AppointmentStatus["CONFIRMED"] = "CONFIRMED";
    /** El paciente ha llegado y la consulta está en curso */
    AppointmentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    /** Consulta finalizada con éxito */
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    /** Cancelada (por el cliente o la clínica) */
    AppointmentStatus["CANCELLED"] = "CANCELLED";
    /** El paciente no se presentó */
    AppointmentStatus["NO_SHOW"] = "NO_SHOW";
    /** Reprogramada a otra fecha/hora */
    AppointmentStatus["RESCHEDULED"] = "RESCHEDULED";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
/** Tipo de cita */
var AppointmentType;
(function (AppointmentType) {
    /** Consulta general / chequeo rutinario */
    AppointmentType["GENERAL_CHECKUP"] = "GENERAL_CHECKUP";
    /** Vacunación */
    AppointmentType["VACCINATION"] = "VACCINATION";
    /** Cirugía */
    AppointmentType["SURGERY"] = "SURGERY";
    /** Urgencia / emergencia */
    AppointmentType["EMERGENCY"] = "EMERGENCY";
    /** Seguimiento de tratamiento */
    AppointmentType["FOLLOW_UP"] = "FOLLOW_UP";
    /** Consulta de especialidad */
    AppointmentType["SPECIALIST"] = "SPECIALIST";
    /** Grooming / estética */
    AppointmentType["GROOMING"] = "GROOMING";
    /** Consulta de laboratorio / resultados */
    AppointmentType["LABORATORY"] = "LABORATORY";
    /** Imagen diagnóstica (rayos X, ecografía) */
    AppointmentType["IMAGING"] = "IMAGING";
    /** Otro tipo no categorizado */
    AppointmentType["OTHER"] = "OTHER";
})(AppointmentType || (exports.AppointmentType = AppointmentType = {}));
/** Prioridad de la cita */
var AppointmentPriority;
(function (AppointmentPriority) {
    AppointmentPriority["LOW"] = "LOW";
    AppointmentPriority["NORMAL"] = "NORMAL";
    AppointmentPriority["HIGH"] = "HIGH";
    AppointmentPriority["URGENT"] = "URGENT";
})(AppointmentPriority || (exports.AppointmentPriority = AppointmentPriority = {}));
/** Etiquetas legibles para AppointmentStatus */
exports.APPOINTMENT_STATUS_LABELS = {
    [AppointmentStatus.PENDING_CONFIRMATION]: 'Pendiente de confirmación',
    [AppointmentStatus.CONFIRMED]: 'Confirmada',
    [AppointmentStatus.IN_PROGRESS]: 'En curso',
    [AppointmentStatus.COMPLETED]: 'Completada',
    [AppointmentStatus.CANCELLED]: 'Cancelada',
    [AppointmentStatus.NO_SHOW]: 'No se presentó',
    [AppointmentStatus.RESCHEDULED]: 'Reprogramada',
};
/** Estados que indican que la cita ya no está activa */
exports.TERMINAL_APPOINTMENT_STATUSES = [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
];
/** Estados que permiten edición de la cita */
exports.EDITABLE_APPOINTMENT_STATUSES = [
    AppointmentStatus.PENDING_CONFIRMATION,
    AppointmentStatus.CONFIRMED,
];
//# sourceMappingURL=appointment.enum.js.map