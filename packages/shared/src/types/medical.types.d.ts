import { TenantEntity } from './common.types';
/** Signos vitales tomados durante la consulta */
export interface VitalSigns {
    /** Peso en kilogramos */
    weightKg?: number;
    /** Temperatura corporal en Celsius */
    temperatureCelsius?: number;
    /** Frecuencia cardíaca en pulsaciones por minuto */
    heartRateBpm?: number;
    /** Frecuencia respiratoria en respiraciones por minuto */
    respiratoryRateRpm?: number;
    /** Presión arterial sistólica en mmHg */
    bloodPressureSystolic?: number;
    /** Presión arterial diastólica en mmHg */
    bloodPressureDiastolic?: number;
    /** Saturación de oxígeno en % */
    oxygenSaturationPercent?: number;
    /** Condición corporal — escala 1-9 */
    bodyConditionScore?: number;
    /** Condición muscular — escala 1-4 */
    muscleConditionScore?: number;
    /** Tiempo de llenado capilar en segundos */
    capillaryRefillTimeSeconds?: number;
    /** Color de mucosas */
    mucousMembraneColor?: string;
    /** Nivel de dolor — escala 0-10 */
    painScore?: number;
    /** Notas adicionales sobre los signos */
    notes?: string;
}
/** Tipo de diagnóstico */
export declare enum DiagnosisType {
    /** Diagnóstico definitivo */
    DEFINITIVE = "DEFINITIVE",
    /** Diagnóstico presuntivo / provisional */
    PRESUMPTIVE = "PRESUMPTIVE",
    /** Diagnóstico diferencial */
    DIFFERENTIAL = "DIFFERENTIAL",
    /** Diagnóstico de trabajo */
    WORKING = "WORKING",
    /** Diagnóstico descartado */
    RULED_OUT = "RULED_OUT"
}
/** Diagnóstico clínico */
export interface Diagnosis {
    id: string;
    /** Nombre de la condición/enfermedad */
    name: string;
    /** Código ICD-10 o VeNom si aplica */
    code?: string;
    type: DiagnosisType;
    /** Notas del veterinario sobre este diagnóstico */
    notes?: string;
    /** Si es diagnóstico primario */
    isPrimary: boolean;
}
/** Procedimiento realizado en consulta */
export interface Procedure {
    id: string;
    name: string;
    /** Código de procedimiento si aplica */
    code?: string;
    /** Descripción del procedimiento realizado */
    description?: string;
    /** Resultado o hallazgo del procedimiento */
    result?: string;
    /** Realizado por */
    performedByVetId: string;
}
/** Unidades de dosificación */
export type DosageUnit = 'mg' | 'mcg' | 'g' | 'ml' | 'IU' | 'tablet' | 'capsule' | 'drop' | 'puff' | 'application';
/** Vía de administración */
export declare enum AdministrationRoute {
    ORAL = "ORAL",
    INTRAVENOUS = "IV",
    INTRAMUSCULAR = "IM",
    SUBCUTANEOUS = "SC",
    TOPICAL = "TOPICAL",
    OPHTHALMIC = "OPHTHALMIC",
    OTIC = "OTIC",
    INTRANASAL = "INTRANASAL",
    INHALATION = "INHALATION",
    RECTAL = "RECTAL",
    TRANSDERMAL = "TRANSDERMAL",
    OTHER = "OTHER"
}
/** Estado de una prescripción */
export declare enum PrescriptionStatus {
    /** Activa — en curso */
    ACTIVE = "ACTIVE",
    /** Completada — tratamiento finalizado */
    COMPLETED = "COMPLETED",
    /** Discontinuada antes de terminar */
    DISCONTINUED = "DISCONTINUED",
    /** En espera de dispensación */
    PENDING_DISPENSING = "PENDING_DISPENSING"
}
/** Prescripción de medicamento */
export interface Prescription extends TenantEntity {
    /** ID del historial clínico al que pertenece */
    medicalRecordId: string;
    /** ID del paciente */
    petId: string;
    /** ID del veterinario que prescribe */
    prescribingVetId: string;
    /** Nombre del medicamento */
    medicationName: string;
    /** Principio activo */
    activeIngredient?: string;
    /** Concentración, p.ej. '500 mg/ml' */
    concentration?: string;
    /** Cantidad por dosis */
    dosageAmount: number;
    dosageUnit: DosageUnit;
    /** Frecuencia, p.ej. 'Cada 12 horas', 'Una vez al día' */
    frequency: string;
    route: AdministrationRoute;
    /** Duración del tratamiento en días */
    durationDays?: number;
    /** Fecha de inicio del tratamiento */
    startDate: Date;
    /** Fecha de fin del tratamiento */
    endDate?: Date;
    /** Número total de unidades dispensadas */
    quantityDispensed?: number;
    /** Instrucciones para el dueño */
    instructions: string;
    /** Advertencias / contraindicaciones */
    warnings?: string;
    status: PrescriptionStatus;
    /** Número de refills permitidos */
    refillsAllowed: number;
    /** Número de refills usados */
    refillsUsed: number;
    /** Notas del veterinario */
    notes?: string;
}
/** Registro de vacunación */
export interface VaccinationRecord extends TenantEntity {
    petId: string;
    /** Nombre de la vacuna */
    vaccineName: string;
    /** Fabricante */
    manufacturer?: string;
    /** Número de lote */
    lotNumber?: string;
    /** Fecha de administración */
    administeredAt: Date;
    /** Dosis / refuerzo número */
    doseNumber?: number;
    /** Fecha de la próxima dosis */
    nextDueDate?: Date;
    /** ID del veterinario que administró */
    administeredByVetId: string;
    /** Sitio de aplicación */
    administrationSite?: string;
    /** Número de microchip asociado al certificado */
    certificateNumber?: string;
    /** Notas */
    notes?: string;
}
/** Tipo de archivo adjunto */
export declare enum MedicalAttachmentType {
    LAB_RESULT = "LAB_RESULT",
    XRAY = "XRAY",
    ULTRASOUND = "ULTRASOUND",
    PHOTO = "PHOTO",
    ECG = "ECG",
    REPORT = "REPORT",
    OTHER = "OTHER"
}
/** Archivo adjunto al historial clínico */
export interface MedicalAttachment {
    id: string;
    type: MedicalAttachmentType;
    /** Nombre descriptivo del archivo */
    name: string;
    /** URL de descarga */
    fileUrl: string;
    /** Mime type del archivo */
    mimeType: string;
    /** Tamaño en bytes */
    sizeBytes: number;
    /** Fecha del estudio/análisis (puede diferir de la fecha de subida) */
    studyDate?: Date;
    /** Notas sobre el adjunto */
    notes?: string;
    uploadedByUserId: string;
    uploadedAt: Date;
}
/** Estado del historial clínico */
export declare enum MedicalRecordStatus {
    /** Borrador — en proceso de edición */
    DRAFT = "DRAFT",
    /** Finalizado — firmado por el veterinario */
    FINALIZED = "FINALIZED",
    /** Corregido (hubo una enmienda) */
    AMENDED = "AMENDED"
}
/**
 * Historial clínico de una consulta. Sigue el formato SOAP:
 *   S = Subjective (lo que reporta el dueño)
 *   O = Objective  (hallazgos clínicos del vet)
 *   A = Assessment (diagnóstico)
 *   P = Plan       (plan de tratamiento)
 */
export interface MedicalRecord extends TenantEntity {
    petId: string;
    ownerId: string;
    /** Cita asociada (puede ser null para registros de vacunación o importados) */
    appointmentId?: string | null;
    /** Veterinario que firma el historial */
    authorVetId: string;
    status: MedicalRecordStatus;
    /** Motivo de la visita y síntomas según el dueño */
    subjectiveNotes: string;
    /** Examen físico y hallazgos clínicos objetivos */
    objectiveNotes: string;
    /** Evaluación / diagnósticos */
    assessmentNotes: string;
    /** Plan de tratamiento y seguimiento */
    planNotes: string;
    vitalSigns?: VitalSigns;
    diagnoses: Diagnosis[];
    procedures: Procedure[];
    prescriptions: Prescription[];
    vaccinationRecords: VaccinationRecord[];
    attachments: MedicalAttachment[];
    /** Fecha en que el vet finalizó y firmó el historial */
    finalizedAt?: Date;
    /** Si hubo enmienda, motivo de la misma */
    amendmentReason?: string;
    /** ID del historial original si este es una enmienda */
    amendedFromRecordId?: string;
    /** Notas internas no visibles para el dueño */
    internalNotes?: string;
    /** Instrucciones para el dueño */
    ownerInstructions?: string;
    /** Si las instrucciones fueron enviadas al dueño */
    ownerInstructionsSentAt?: Date;
    /** Metadatos adicionales */
    metadata?: Record<string, unknown>;
}
export interface CreateMedicalRecordDto {
    petId: string;
    ownerId: string;
    appointmentId?: string;
    authorVetId: string;
    subjectiveNotes?: string;
    objectiveNotes?: string;
    assessmentNotes?: string;
    planNotes?: string;
    vitalSigns?: VitalSigns;
}
export interface UpdateMedicalRecordDto {
    subjectiveNotes?: string;
    objectiveNotes?: string;
    assessmentNotes?: string;
    planNotes?: string;
    vitalSigns?: VitalSigns;
    diagnoses?: Diagnosis[];
    internalNotes?: string;
    ownerInstructions?: string;
}
export interface FinalizeMedicalRecordDto {
    ownerInstructions?: string;
}
export interface AmendMedicalRecordDto {
    amendmentReason: string;
    subjectiveNotes?: string;
    objectiveNotes?: string;
    assessmentNotes?: string;
    planNotes?: string;
    vitalSigns?: VitalSigns;
    diagnoses?: Diagnosis[];
    ownerInstructions?: string;
}
/** Vista resumida para líneas de tiempo y listados */
export type MedicalRecordSummary = Pick<MedicalRecord, 'id' | 'petId' | 'appointmentId' | 'authorVetId' | 'status' | 'createdAt' | 'finalizedAt' | 'tenantId'> & {
    diagnosisCount: number;
    prescriptionCount: number;
    primaryDiagnosisName?: string;
    vetFullName?: string;
};
//# sourceMappingURL=medical.types.d.ts.map