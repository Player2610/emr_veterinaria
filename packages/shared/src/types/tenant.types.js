"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantPlan = exports.TenantModule = void 0;
/** Módulos funcionales que se pueden activar por tenant */
var TenantModule;
(function (TenantModule) {
    /** Historial clínico digital */
    TenantModule["MEDICAL_RECORDS"] = "MEDICAL_RECORDS";
    /** Portal de clientes */
    TenantModule["CLIENT_PORTAL"] = "CLIENT_PORTAL";
    /** Gestión de inventario */
    TenantModule["INVENTORY"] = "INVENTORY";
    /** Facturación y pagos */
    TenantModule["BILLING"] = "BILLING";
    /** Telemedicina */
    TenantModule["TELEMEDICINE"] = "TELEMEDICINE";
    /** Laboratorio interno */
    TenantModule["LABORATORY"] = "LABORATORY";
    /** Informes y analíticas */
    TenantModule["ANALYTICS"] = "ANALYTICS";
    /** Recordatorios automáticos de vacunación */
    TenantModule["VACCINATION_REMINDERS"] = "VACCINATION_REMINDERS";
})(TenantModule || (exports.TenantModule = TenantModule = {}));
// ─────────────────────────────────────────────────────────────────────────────
// Plan de suscripción
// ─────────────────────────────────────────────────────────────────────────────
var TenantPlan;
(function (TenantPlan) {
    /** Plan gratuito / trial */
    TenantPlan["FREE"] = "FREE";
    /** Plan básico */
    TenantPlan["STARTER"] = "STARTER";
    /** Plan profesional */
    TenantPlan["PROFESSIONAL"] = "PROFESSIONAL";
    /** Plan clínica / multi-sede */
    TenantPlan["ENTERPRISE"] = "ENTERPRISE";
})(TenantPlan || (exports.TenantPlan = TenantPlan = {}));
//# sourceMappingURL=tenant.types.js.map