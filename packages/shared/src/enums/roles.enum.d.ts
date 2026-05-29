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
export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    TENANT_ADMIN = "TENANT_ADMIN",
    VET = "VET",
    ASSISTANT = "ASSISTANT",
    PET_OWNER = "PET_OWNER"
}
/** Roles que tienen acceso al panel de administración del tenant */
export declare const CLINIC_STAFF_ROLES: UserRole[];
/** Roles con capacidad de gestionar la configuración del tenant */
export declare const ADMIN_ROLES: UserRole[];
//# sourceMappingURL=roles.enum.d.ts.map