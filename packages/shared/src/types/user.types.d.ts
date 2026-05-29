import { TenantEntity, ActiveStatus, ContactInfo } from './common.types';
import { UserRole } from '../enums/roles.enum';
/** Información personal del usuario */
export interface UserProfile {
    firstName: string;
    lastName: string;
    /** Apodo o nombre de pila como prefiere ser llamado */
    displayName?: string;
    /** URL al avatar del usuario */
    avatarUrl?: string | null;
    /** Fecha de nacimiento */
    dateOfBirth?: Date;
    /** Idioma preferido del usuario, p.ej. 'es', 'en' */
    preferredLanguage: string;
    /** Zona horaria del usuario, p.ej. 'America/Mexico_City' */
    timezone: string;
}
/** Preferencias de notificación del usuario */
export interface UserNotificationPreferences {
    emailNewAppointment: boolean;
    emailAppointmentReminder: boolean;
    emailAppointmentCancellation: boolean;
    emailMedicalRecordReady: boolean;
    smsNewAppointment: boolean;
    smsAppointmentReminder: boolean;
    pushNotifications: boolean;
}
/**
 * Usuario del sistema.
 * Un mismo email puede tener acceso a múltiples tenants con roles distintos —
 * eso se gestiona a través de TenantMembership.
 */
export interface User extends TenantEntity {
    email: string;
    role: UserRole;
    status: ActiveStatus;
    profile: UserProfile;
    contactInfo?: ContactInfo;
    notificationPreferences: UserNotificationPreferences;
    /** Fecha del último inicio de sesión */
    lastLoginAt: Date | null;
    /** Si el email ha sido verificado */
    emailVerifiedAt: Date | null;
    /** Si tiene 2FA activado */
    twoFactorEnabled: boolean;
}
/** Relación entre usuario y tenant (para usuarios con acceso a varios tenants) */
export interface TenantMembership extends TenantEntity {
    userId: string;
    role: UserRole;
    status: ActiveStatus;
    /** Fecha desde la que el usuario tiene acceso al tenant */
    joinedAt: Date;
    /** Usuario que invitó a este miembro */
    invitedByUserId?: string;
    /** Permisos adicionales o restricciones sobre el rol base */
    customPermissions?: string[];
}
/** Datos necesarios para crear un nuevo usuario */
export interface CreateUserDto {
    email: string;
    password: string;
    role: UserRole;
    profile: UserProfile;
    contactInfo?: ContactInfo;
}
/** Datos actualizables de un usuario */
export interface UpdateUserDto {
    role?: UserRole;
    status?: ActiveStatus;
    profile?: Partial<UserProfile>;
    contactInfo?: ContactInfo;
    notificationPreferences?: Partial<UserNotificationPreferences>;
}
/** Respuesta al autenticar: tokens + datos básicos del usuario */
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    /** Tiempo de expiración del access token en segundos */
    expiresIn: number;
}
/** Payload decodificado del JWT */
export interface JwtPayload {
    /** Subject: userId */
    sub: string;
    email: string;
    role: UserRole;
    tenantId: string;
    /** Issued at */
    iat: number;
    /** Expiration */
    exp: number;
}
/** Versión pública del usuario (sin datos sensibles) */
export type UserPublic = Omit<User, 'twoFactorEnabled' | 'emailVerifiedAt' | 'lastLoginAt'>;
/** Datos mínimos del usuario para mostrar en listas / selects */
export type UserSummary = Pick<User, 'id' | 'email' | 'role' | 'status' | 'tenantId'> & {
    fullName: string;
    avatarUrl?: string | null;
};
//# sourceMappingURL=user.types.d.ts.map