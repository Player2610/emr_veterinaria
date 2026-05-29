"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADMIN_ROLES = exports.CLINIC_STAFF_ROLES = exports.UserRole = void 0;
/**
 * Roles de usuario en el sistema EMR Veterinario multi-tenant.
 *
 * Jerarquía:
 *   SUPER_ADMIN  → acceso total a todos los tenants (Anthropic/nosotros)
 *   TENANT_ADMIN → dueño/administrador de una clínica concreta
 *   VET          → veterinario que atiende consultas
 *   ASSISTANT    → asistente/recepcionista de clínica
 *   PET_OWNER    → dueño de mascota (portal de clientes)
 */
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["TENANT_ADMIN"] = "TENANT_ADMIN";
    UserRole["VET"] = "VET";
    UserRole["ASSISTANT"] = "ASSISTANT";
    UserRole["PET_OWNER"] = "PET_OWNER";
})(UserRole || (exports.UserRole = UserRole = {}));
/** Roles que tienen acceso al panel de administración del tenant */
exports.CLINIC_STAFF_ROLES = [
    UserRole.TENANT_ADMIN,
    UserRole.VET,
    UserRole.ASSISTANT,
];
/** Roles con capacidad de gestionar la configuración del tenant */
exports.ADMIN_ROLES = [
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
];
//# sourceMappingURL=roles.enum.js.map