/**
 * @emr/database
 *
 * Re-exporta PrismaClient y todos los tipos generados para que el resto
 * de los packages/apps puedan importar desde un único punto:
 *
 *   import { prisma, Prisma, type Pet } from '@emr/database';
 */

export {
  PrismaClient,
  Prisma,
  // Enums
  UserRole,
  Species,
  Gender,
  AppointmentStatus,
  AppointmentType,
  TenantPlan,
} from '@prisma/client';

export type {
  // Modelos base (tipos de fila)
  Tenant,
  User,
  Owner,
  Pet,
  Vet,
  Appointment,
  MedicalRecord,
  Attachment,
  AuditLog,
} from '@prisma/client';

import { PrismaClient } from '@prisma/client';

// ─── Singleton del cliente ────────────────────────────────────
// En desarrollo se reutiliza la misma instancia entre hot-reloads
// para no agotar el pool de conexiones de PostgreSQL.

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalThis.__prisma = prisma;
}
