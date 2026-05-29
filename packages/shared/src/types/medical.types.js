"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalRecordStatus = exports.MedicalAttachmentType = exports.PrescriptionStatus = exports.AdministrationRoute = exports.DiagnosisType = void 0;
// ─────────────────────────────────────────────────────────────────────────────
// Diagnóstico
// ─────────────────────────────────────────────────────────────────────────────
/** Tipo de diagnóstico */
var DiagnosisType;
(function (DiagnosisType) {
    /** Diagnóstico definitivo */
    DiagnosisType["DEFINITIVE"] = "DEFINITIVE";
    /** Diagnóstico presuntivo / provisional */
    DiagnosisType["PRESUMPTIVE"] = "PRESUMPTIVE";
    /** Diagnóstico diferencial */
    DiagnosisType["DIFFERENTIAL"] = "DIFFERENTIAL";
    /** Diagnóstico de trabajo */
    DiagnosisType["WORKING"] = "WORKING";
    /** Diagnóstico descartado */
    DiagnosisType["RULED_OUT"] = "RULED_OUT";
})(DiagnosisType || (exports.DiagnosisType = DiagnosisType = {}));
/** Vía de administración */
var AdministrationRoute;
(function (AdministrationRoute) {
    AdministrationRoute["ORAL"] = "ORAL";
    AdministrationRoute["INTRAVENOUS"] = "IV";
    AdministrationRoute["INTRAMUSCULAR"] = "IM";
    AdministrationRoute["SUBCUTANEOUS"] = "SC";
    AdministrationRoute["TOPICAL"] = "TOPICAL";
    AdministrationRoute["OPHTHALMIC"] = "OPHTHALMIC";
    AdministrationRoute["OTIC"] = "OTIC";
    AdministrationRoute["INTRANASAL"] = "INTRANASAL";
    AdministrationRoute["INHALATION"] = "INHALATION";
    AdministrationRoute["RECTAL"] = "RECTAL";
    AdministrationRoute["TRANSDERMAL"] = "TRANSDERMAL";
    AdministrationRoute["OTHER"] = "OTHER";
})(AdministrationRoute || (exports.AdministrationRoute = AdministrationRoute = {}));
/** Estado de una prescripción */
var PrescriptionStatus;
(function (PrescriptionStatus) {
    /** Activa — en curso */
    PrescriptionStatus["ACTIVE"] = "ACTIVE";
    /** Completada — tratamiento finalizado */
    PrescriptionStatus["COMPLETED"] = "COMPLETED";
    /** Discontinuada antes de terminar */
    PrescriptionStatus["DISCONTINUED"] = "DISCONTINUED";
    /** En espera de dispensación */
    PrescriptionStatus["PENDING_DISPENSING"] = "PENDING_DISPENSING";
})(PrescriptionStatus || (exports.PrescriptionStatus = PrescriptionStatus = {}));
// ─────────────────────────────────────────────────────────────────────────────
// Adjuntos del historial
// ─────────────────────────────────────────────────────────────────────────────
/** Tipo de archivo adjunto */
var MedicalAttachmentType;
(function (MedicalAttachmentType) {
    MedicalAttachmentType["LAB_RESULT"] = "LAB_RESULT";
    MedicalAttachmentType["XRAY"] = "XRAY";
    MedicalAttachmentType["ULTRASOUND"] = "ULTRASOUND";
    MedicalAttachmentType["PHOTO"] = "PHOTO";
    MedicalAttachmentType["ECG"] = "ECG";
    MedicalAttachmentType["REPORT"] = "REPORT";
    MedicalAttachmentType["OTHER"] = "OTHER";
})(MedicalAttachmentType || (exports.MedicalAttachmentType = MedicalAttachmentType = {}));
// ─────────────────────────────────────────────────────────────────────────────
// Historial Clínico (Medical Record / SOAP)
// ─────────────────────────────────────────────────────────────────────────────
/** Estado del historial clínico */
var MedicalRecordStatus;
(function (MedicalRecordStatus) {
    /** Borrador — en proceso de edición */
    MedicalRecordStatus["DRAFT"] = "DRAFT";
    /** Finalizado — firmado por el veterinario */
    MedicalRecordStatus["FINALIZED"] = "FINALIZED";
    /** Corregido (hubo una enmienda) */
    MedicalRecordStatus["AMENDED"] = "AMENDED";
})(MedicalRecordStatus || (exports.MedicalRecordStatus = MedicalRecordStatus = {}));
//# sourceMappingURL=medical.types.js.map