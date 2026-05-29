import { BaseEntity, ActiveStatus, ContactInfo, Address } from './common.types';

// ─────────────────────────────────────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Colores del tema expresados como strings HSL.
 * Formato: "H S% L%"  →  p.ej. "220 90% 56%"
 * Esto permite que el frontend los use directamente como variables CSS HSL:
 *   --primary: 220 90% 56%;
 *   color: hsl(var(--primary));
 */
export interface TenantThemeColors {
  /** Color de acción principal (botones, enlaces, CTA) */
  primary: string;
  /** Color secundario / complementario */
  secondary: string;
  /** Color de acento para highlights y badges */
  accent: string;
  /** Color de fondo principal */
  background: string;
  /** Color de fondo de superficies (cards, modals) */
  surface: string;
  /** Color de texto principal */
  foreground: string;
  /** Color de texto sobre superficie */
  surfaceForeground: string;
  /** Color para estados de error */
  destructive: string;
  /** Color de bordes y separadores */
  border: string;
  /** Color para inputs */
  input: string;
  /** Color del anillo de foco */
  ring: string;
  /** Color de texto muted / secundario */
  mutedForeground: string;
}

/** Tipografías disponibles */
export type TenantFontFamily =
  | 'Inter'
  | 'Roboto'
  | 'Poppins'
  | 'Nunito'
  | 'Open Sans'
  | 'Lato'
  | string; // permite fuentes custom

/** Variantes de radio de borde para el tema */
export type TenantBorderRadius =
  | 'none'    // 0rem
  | 'sm'      // 0.25rem
  | 'md'      // 0.5rem
  | 'lg'      // 0.75rem
  | 'xl'      // 1rem
  | 'full';   // 9999px

/** Configuración visual completa de un tenant */
export interface TenantTheme {
  /** Nombre visible de la clínica en la UI */
  clinicName: string;
  /** URL absoluta al logo principal (recomendado SVG o PNG con transparencia) */
  logoUrl: string | null;
  /** URL al logo reducido / ícono cuadrado (para favicon y nav colapsada) */
  logoIconUrl: string | null;
  /** URL al logo en versión blanca/clara (para fondos oscuros) */
  logoLightUrl: string | null;
  /** Paleta de colores del tema claro */
  colors: TenantThemeColors;
  /** Paleta de colores del tema oscuro (opcional; si no se provee, se genera automáticamente) */
  colorsDark?: TenantThemeColors;
  fontFamily: TenantFontFamily;
  borderRadius: TenantBorderRadius;
  /** CSS personalizado adicional que se inyecta en el <head> */
  customCss?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuración operativa del tenant
// ─────────────────────────────────────────────────────────────────────────────

/** Días de la semana */
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

/** Bloque horario de atención */
export interface BusinessHours {
  /** Si la clínica atiende ese día */
  isOpen: boolean;
  /** Hora de apertura en formato HH:mm (24 h) */
  openTime: string;
  /** Hora de cierre en formato HH:mm (24 h) */
  closeTime: string;
  /** Bloques de descanso dentro del día */
  breaks?: Array<{ from: string; to: string }>;
}

/** Horario semanal completo */
export type WeeklySchedule = Record<DayOfWeek, BusinessHours>;

/** Configuración de notificaciones del tenant */
export interface TenantNotificationSettings {
  /** Enviar recordatorio de cita por email */
  emailReminders: boolean;
  /** Horas antes de la cita para enviar el recordatorio */
  emailReminderHoursBeforeAppointment: number;
  /** Enviar recordatorio por SMS */
  smsReminders: boolean;
  /** Enviar confirmación al crear una cita */
  confirmationOnBooking: boolean;
  /** Notificar al vet cuando se agenda una cita con él */
  notifyVetOnNewAppointment: boolean;
}

/** Configuración de facturación / billing del tenant */
export interface TenantBillingSettings {
  /** Moneda ISO 4217, p.ej. 'EUR', 'USD', 'MXN' */
  currency: string;
  /** Locale para formateo de números, p.ej. 'es-MX' */
  locale: string;
  /** Porcentaje de IVA/impuesto aplicable */
  taxRate: number;
  /** Nombre del impuesto, p.ej. 'IVA', 'VAT', 'GST' */
  taxName: string;
  /** Mostrar precios con impuesto incluido en la UI */
  priceIncludesTax: boolean;
}

/** Configuración de citas del tenant */
export interface TenantAppointmentSettings {
  /** Duración por defecto de una cita en minutos */
  defaultAppointmentDurationMinutes: number;
  /** Buffer entre citas en minutos */
  bufferBetweenAppointmentsMinutes: number;
  /** Con cuántos días de antelación mínima se puede pedir cita online */
  minAdvanceBookingDays: number;
  /** Con cuántos días de antelación máxima se puede pedir cita online */
  maxAdvanceBookingDays: number;
  /** Permitir que los clientes pidan cita online sin confirmación manual */
  allowOnlineBooking: boolean;
  /** Requerir aprobación manual de citas online */
  requireApprovalForOnlineBooking: boolean;
  /** Número máximo de citas simultáneas por veterinario */
  maxConcurrentAppointmentsPerVet: number;
}

/** Conjunto completo de ajustes operativos del tenant */
export interface TenantSettings {
  /** Zona horaria IANA, p.ej. 'America/Mexico_City' */
  timezone: string;
  /** Idioma principal, p.ej. 'es', 'en' */
  language: string;
  schedule: WeeklySchedule;
  notifications: TenantNotificationSettings;
  billing: TenantBillingSettings;
  appointments: TenantAppointmentSettings;
  /** Módulos habilitados para este tenant */
  enabledModules: TenantModule[];
}

/** Módulos funcionales que se pueden activar por tenant */
export enum TenantModule {
  /** Historial clínico digital */
  MEDICAL_RECORDS = 'MEDICAL_RECORDS',
  /** Portal de clientes */
  CLIENT_PORTAL = 'CLIENT_PORTAL',
  /** Gestión de inventario */
  INVENTORY = 'INVENTORY',
  /** Facturación y pagos */
  BILLING = 'BILLING',
  /** Telemedicina */
  TELEMEDICINE = 'TELEMEDICINE',
  /** Laboratorio interno */
  LABORATORY = 'LABORATORY',
  /** Informes y analíticas */
  ANALYTICS = 'ANALYTICS',
  /** Recordatorios automáticos de vacunación */
  VACCINATION_REMINDERS = 'VACCINATION_REMINDERS',
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan de suscripción
// ─────────────────────────────────────────────────────────────────────────────

export enum TenantPlan {
  /** Plan gratuito / trial */
  FREE = 'FREE',
  /** Plan básico */
  STARTER = 'STARTER',
  /** Plan profesional */
  PROFESSIONAL = 'PROFESSIONAL',
  /** Plan clínica / multi-sede */
  ENTERPRISE = 'ENTERPRISE',
}

// ─────────────────────────────────────────────────────────────────────────────
// Entidad Tenant
// ─────────────────────────────────────────────────────────────────────────────

/** Entidad principal que representa una clínica/organización en el sistema */
export interface Tenant extends BaseEntity {
  /** Nombre legal de la clínica */
  name: string;
  /** Slug único usado en subdominio y URLs: acme-vet.emr.app */
  slug: string;
  /** Número de identificación fiscal (RFC, NIF, CIF, etc.) */
  taxId?: string;
  status: ActiveStatus;
  plan: TenantPlan;
  /** Fecha en que expira el plan / trial */
  planExpiresAt: Date | null;
  contactInfo: ContactInfo;
  address?: Address;
  theme: TenantTheme;
  settings: TenantSettings;
  /** Número máximo de usuarios staff permitidos por el plan */
  maxStaffUsers: number;
  /** Número máximo de pacientes activos permitidos por el plan */
  maxPatients: number;
  /** Dominio personalizado del tenant, p.ej. 'app.miClinica.com' */
  customDomain?: string;
  /** Metadatos adicionales libres */
  metadata?: Record<string, unknown>;
}

/** Versión reducida del tenant para respuestas donde no se necesita todo */
export type TenantSummary = Pick<
  Tenant,
  'id' | 'name' | 'slug' | 'status' | 'plan' | 'theme'
>;

/** Contexto de tenant disponible en el frontend (sin datos sensibles) */
export interface TenantContext {
  id: string;
  name: string;
  slug: string;
  theme: TenantTheme;
  settings: Pick<TenantSettings, 'timezone' | 'language' | 'enabledModules'>;
  plan: TenantPlan;
}
