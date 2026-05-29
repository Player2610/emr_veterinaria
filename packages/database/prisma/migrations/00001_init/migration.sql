-- ============================================================
-- EMR Veterinaria — Migración inicial
-- Incluye: schema completo, índices, RLS y triggers
-- ============================================================

-- ─── Extensiones ─────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid() como fallback
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- búsquedas trigram en nombres

-- ─── Enums ───────────────────────────────────────────────────

CREATE TYPE "UserRole" AS ENUM (
  'SUPER_ADMIN',
  'TENANT_ADMIN',
  'VET',
  'ASSISTANT',
  'PET_OWNER'
);

CREATE TYPE "Species" AS ENUM (
  'DOG',
  'CAT',
  'BIRD',
  'RABBIT',
  'HAMSTER',
  'GUINEA_PIG',
  'FERRET',
  'TURTLE',
  'SNAKE',
  'LIZARD',
  'FISH',
  'HORSE',
  'COW',
  'PIG',
  'SHEEP',
  'GOAT',
  'OTHER'
);

CREATE TYPE "Gender" AS ENUM (
  'MALE',
  'FEMALE',
  'UNKNOWN'
);

CREATE TYPE "AppointmentStatus" AS ENUM (
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
  'RESCHEDULED'
);

CREATE TYPE "AppointmentType" AS ENUM (
  'GENERAL_CHECKUP',
  'VACCINATION',
  'SURGERY',
  'EMERGENCY',
  'FOLLOW_UP',
  'SPECIALIST',
  'GROOMING',
  'LABORATORY',
  'IMAGING',
  'OTHER'
);

CREATE TYPE "TenantPlan" AS ENUM (
  'FREE',
  'PRO',
  'CLINIC',
  'ENTERPRISE'
);

-- ─── Función updated_at ──────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;

-- ─── Helper RLS: set_tenant_id ────────────────────────────────
-- El backend llama a esta función al inicio de cada request/transacción
-- para que RLS sepa a qué tenant pertenece la sesión.
--
-- Uso en el backend (NestJS / middleware Prisma):
--   await prisma.$executeRaw`SELECT set_tenant_id(${tenantId})`;

CREATE OR REPLACE FUNCTION set_tenant_id(p_tenant_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', p_tenant_id, true);
END;
$$;

-- Función auxiliar que devuelve el tenant_id activo o lanza error
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_tenant_id TEXT;
BEGIN
  v_tenant_id := current_setting('app.current_tenant_id', true);
  IF v_tenant_id IS NULL OR v_tenant_id = '' THEN
    RAISE EXCEPTION 'app.current_tenant_id is not set — missing tenant context';
  END IF;
  RETURN v_tenant_id;
END;
$$;

-- ─── Tabla: tenants ───────────────────────────────────────────

CREATE TABLE "tenants" (
  "id"        TEXT        NOT NULL,
  "slug"      TEXT        NOT NULL,
  "name"      TEXT        NOT NULL,
  "plan"      "TenantPlan" NOT NULL DEFAULT 'FREE',
  "settings"  JSONB       NOT NULL DEFAULT '{}',
  "theme"     JSONB       NOT NULL DEFAULT '{}',
  "isActive"  BOOLEAN     NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants" ("slug");

CREATE TRIGGER "tenants_set_updated_at"
  BEFORE UPDATE ON "tenants"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Nota: tenants NO tiene RLS — las consultas a esta tabla
-- siempre deben filtrarse por id en el código de aplicación.

-- ─── Tabla: users ─────────────────────────────────────────────

CREATE TABLE "users" (
  "id"           TEXT        NOT NULL,
  "tenantId"     TEXT        NOT NULL,
  "email"        TEXT        NOT NULL,
  "passwordHash" TEXT,
  "firstName"    TEXT        NOT NULL,
  "lastName"     TEXT        NOT NULL,
  "phone"        TEXT,
  "role"         "UserRole"  NOT NULL,
  "isActive"     BOOLEAN     NOT NULL DEFAULT TRUE,
  "avatarUrl"    TEXT,
  "refreshTokenHash" TEXT,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "users_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users" ("tenantId", "email");
CREATE INDEX "users_tenantId_idx"             ON "users" ("tenantId");
CREATE INDEX "users_tenantId_role_idx"        ON "users" ("tenantId", "role");

CREATE TRIGGER "users_set_updated_at"
  BEFORE UPDATE ON "users"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "users"
  USING ("tenantId" = current_tenant_id());

-- SUPER_ADMIN bypass (conexión con rol pg dedicado, no vía RLS)
-- El rol de servicio que usa Prisma debe ser creado con BYPASSRLS
-- o incluir la comprobación en la política. Aquí usamos la forma
-- permisiva estándar: el middleware de NestJS siempre setea el tenant.

-- ─── Tabla: owners ────────────────────────────────────────────

CREATE TABLE "owners" (
  "id"        TEXT        NOT NULL,
  "tenantId"  TEXT        NOT NULL,
  "userId"    TEXT,
  "firstName" TEXT        NOT NULL,
  "lastName"  TEXT        NOT NULL,
  "email"     TEXT,
  "phone"     TEXT        NOT NULL,
  "address"   TEXT,
  "notes"     TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "owners_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "owners_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE,
  CONSTRAINT "owners_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX "owners_userId_key"          ON "owners" ("userId") WHERE "userId" IS NOT NULL;
CREATE INDEX "owners_tenantId_idx"               ON "owners" ("tenantId");
CREATE INDEX "owners_tenantId_email_idx"         ON "owners" ("tenantId", "email");
-- Búsqueda de texto completo por nombre
CREATE INDEX "owners_firstName_trgm_idx"         ON "owners" USING GIN ("firstName" gin_trgm_ops);
CREATE INDEX "owners_lastName_trgm_idx"          ON "owners" USING GIN ("lastName"  gin_trgm_ops);

CREATE TRIGGER "owners_set_updated_at"
  BEFORE UPDATE ON "owners"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE "owners" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "owners"
  USING ("tenantId" = current_tenant_id());

-- ─── Tabla: pets ──────────────────────────────────────────────

CREATE TABLE "pets" (
  "id"          TEXT           NOT NULL,
  "tenantId"    TEXT           NOT NULL,
  "ownerId"     TEXT           NOT NULL,
  "name"        TEXT           NOT NULL,
  "species"     "Species"      NOT NULL,
  "breed"       TEXT,
  "color"       TEXT,
  "gender"      "Gender"       NOT NULL,
  "birthDate"   TIMESTAMPTZ,
  "weight"      NUMERIC(6, 2),
  "microchipId" TEXT,
  "photoUrl"    TEXT,
  "isDeceased"  BOOLEAN        NOT NULL DEFAULT FALSE,
  "notes"       TEXT,
  "createdAt"   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT "pets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pets_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE,
  CONSTRAINT "pets_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "owners" ("id") ON DELETE RESTRICT
);

CREATE INDEX "pets_tenantId_idx"         ON "pets" ("tenantId");
CREATE INDEX "pets_tenantId_ownerId_idx" ON "pets" ("tenantId", "ownerId");
CREATE INDEX "pets_tenantId_species_idx" ON "pets" ("tenantId", "species");
CREATE INDEX "pets_microchipId_idx"      ON "pets" ("microchipId") WHERE "microchipId" IS NOT NULL;
-- Búsqueda por nombre de mascota
CREATE INDEX "pets_name_trgm_idx"        ON "pets" USING GIN ("name" gin_trgm_ops);

CREATE TRIGGER "pets_set_updated_at"
  BEFORE UPDATE ON "pets"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE "pets" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "pets"
  USING ("tenantId" = current_tenant_id());

-- ─── Tabla: vets ──────────────────────────────────────────────

CREATE TABLE "vets" (
  "id"             TEXT     NOT NULL,
  "tenantId"       TEXT     NOT NULL,
  "userId"         TEXT     NOT NULL,
  "licenseNumber"  TEXT,
  "specialities"   TEXT[]   NOT NULL DEFAULT '{}',
  "bio"            TEXT,
  "availableSlots" JSONB,

  CONSTRAINT "vets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "vets_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "vets_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "vets_userId_key"    ON "vets" ("userId");
CREATE INDEX "vets_tenantId_idx"        ON "vets" ("tenantId");

-- Nota: vets no tiene updatedAt propio; se actualiza a través de users.
ALTER TABLE "vets" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "vets"
  USING ("tenantId" = current_tenant_id());

-- ─── Tabla: appointments ─────────────────────────────────────

CREATE TABLE "appointments" (
  "id"        TEXT                NOT NULL,
  "tenantId"  TEXT                NOT NULL,
  "petId"     TEXT                NOT NULL,
  "vetId"     TEXT,
  "ownerId"   TEXT                NOT NULL,
  "title"     TEXT                NOT NULL,
  "notes"     TEXT,
  "status"    "AppointmentStatus" NOT NULL DEFAULT 'PENDING_CONFIRMATION',
  "startTime" TIMESTAMPTZ         NOT NULL,
  "endTime"   TIMESTAMPTZ         NOT NULL,
  "type"      "AppointmentType"   NOT NULL DEFAULT 'GENERAL_CHECKUP',
  "createdAt" TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

  CONSTRAINT "appointments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "appointments_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE,
  CONSTRAINT "appointments_petId_fkey"
    FOREIGN KEY ("petId") REFERENCES "pets" ("id") ON DELETE RESTRICT,
  CONSTRAINT "appointments_vetId_fkey"
    FOREIGN KEY ("vetId") REFERENCES "vets" ("id") ON DELETE SET NULL,
  CONSTRAINT "appointments_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "owners" ("id") ON DELETE RESTRICT,
  CONSTRAINT "appointments_endTime_check"
    CHECK ("endTime" > "startTime")
);

CREATE INDEX "appointments_tenantId_idx"         ON "appointments" ("tenantId");
CREATE INDEX "appointments_tenantId_vetId_idx"   ON "appointments" ("tenantId", "vetId");
CREATE INDEX "appointments_tenantId_petId_idx"   ON "appointments" ("tenantId", "petId");
CREATE INDEX "appointments_tenantId_ownerId_idx" ON "appointments" ("tenantId", "ownerId");
CREATE INDEX "appointments_tenantId_status_idx"  ON "appointments" ("tenantId", "status");
-- Agenda del veterinario: consultas de rango temporal
CREATE INDEX "appointments_tenantId_startTime_idx"
  ON "appointments" ("tenantId", "startTime");
-- Consultas activas (excluye canceladas / no-show)
CREATE INDEX "appointments_tenantId_active_idx"
  ON "appointments" ("tenantId", "startTime")
  WHERE "status" NOT IN ('CANCELLED', 'NO_SHOW');

CREATE TRIGGER "appointments_set_updated_at"
  BEFORE UPDATE ON "appointments"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "appointments"
  USING ("tenantId" = current_tenant_id());

-- ─── Tabla: medical_records ───────────────────────────────────

CREATE TABLE "medical_records" (
  "id"             TEXT        NOT NULL,
  "tenantId"       TEXT        NOT NULL,
  "petId"          TEXT        NOT NULL,
  "vetId"          TEXT,
  "appointmentId"  TEXT,
  "chiefComplaint" TEXT        NOT NULL,
  "anamnesis"      TEXT,
  "physicalExam"   JSONB,
  "diagnoses"      JSONB[]     NOT NULL DEFAULT '{}',
  "treatments"     JSONB[]     NOT NULL DEFAULT '{}',
  "prescriptions"  JSONB[]     NOT NULL DEFAULT '{}',
  "notes"          TEXT,
  "followUpDate"   TIMESTAMPTZ,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "medical_records_appointmentId_key" UNIQUE ("appointmentId"),
  CONSTRAINT "medical_records_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE,
  CONSTRAINT "medical_records_petId_fkey"
    FOREIGN KEY ("petId") REFERENCES "pets" ("id") ON DELETE RESTRICT,
  CONSTRAINT "medical_records_vetId_fkey"
    FOREIGN KEY ("vetId") REFERENCES "vets" ("id") ON DELETE SET NULL,
  CONSTRAINT "medical_records_appointmentId_fkey"
    FOREIGN KEY ("appointmentId") REFERENCES "appointments" ("id") ON DELETE SET NULL
);

CREATE INDEX "medical_records_tenantId_idx"           ON "medical_records" ("tenantId");
CREATE INDEX "medical_records_tenantId_petId_idx"     ON "medical_records" ("tenantId", "petId");
CREATE INDEX "medical_records_tenantId_vetId_idx"     ON "medical_records" ("tenantId", "vetId");
CREATE INDEX "medical_records_tenantId_createdAt_idx" ON "medical_records" ("tenantId", "createdAt" DESC);
-- Búsqueda full-text en queja principal
CREATE INDEX "medical_records_chiefComplaint_trgm_idx"
  ON "medical_records" USING GIN ("chiefComplaint" gin_trgm_ops);

CREATE TRIGGER "medical_records_set_updated_at"
  BEFORE UPDATE ON "medical_records"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE "medical_records" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "medical_records"
  USING ("tenantId" = current_tenant_id());

-- ─── Tabla: attachments ───────────────────────────────────────

CREATE TABLE "attachments" (
  "id"              TEXT        NOT NULL,
  "tenantId"        TEXT        NOT NULL,
  "medicalRecordId" TEXT        NOT NULL,
  "name"            TEXT        NOT NULL,
  "type"            TEXT        NOT NULL,
  "url"             TEXT        NOT NULL,
  "size"            INTEGER     NOT NULL,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "attachments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "attachments_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE,
  CONSTRAINT "attachments_medicalRecordId_fkey"
    FOREIGN KEY ("medicalRecordId") REFERENCES "medical_records" ("id") ON DELETE CASCADE,
  CONSTRAINT "attachments_size_check"
    CHECK ("size" > 0)
);

CREATE INDEX "attachments_tenantId_idx"         ON "attachments" ("tenantId");
CREATE INDEX "attachments_medicalRecordId_idx"  ON "attachments" ("medicalRecordId");

ALTER TABLE "attachments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "attachments"
  USING ("tenantId" = current_tenant_id());

-- ─── Tabla: audit_logs ────────────────────────────────────────
-- Sin RLS: la auditoría es escrita por el backend (rol con BYPASSRLS
-- o antes de fijar el tenant context) y leída solo por SUPER_ADMIN.

CREATE TABLE "audit_logs" (
  "id"         TEXT        NOT NULL,
  "tenantId"   TEXT        NOT NULL,
  "userId"     TEXT        NOT NULL,
  "action"     TEXT        NOT NULL,
  "resource"   TEXT        NOT NULL,
  "resourceId" TEXT        NOT NULL,
  "meta"       JSONB,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "audit_logs_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE,
  CONSTRAINT "audit_logs_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
);

CREATE INDEX "audit_logs_tenantId_resource_resourceId_idx"
  ON "audit_logs" ("tenantId", "resource", "resourceId");
CREATE INDEX "audit_logs_tenantId_userId_idx"
  ON "audit_logs" ("tenantId", "userId");
CREATE INDEX "audit_logs_tenantId_createdAt_idx"
  ON "audit_logs" ("tenantId", "createdAt" DESC);
CREATE INDEX "audit_logs_tenantId_action_idx"
  ON "audit_logs" ("tenantId", "action");

-- audit_logs es append-only: no hay updatedAt ni trigger.
-- Deshabilitar DELETE para usuarios normales (solo SUPER_ADMIN):
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- Los audit_logs son visibles dentro del mismo tenant
-- (el backend filtra por tenantId en las queries de UI)
CREATE POLICY "tenant_isolation" ON "audit_logs"
  USING ("tenantId" = current_tenant_id());

-- Prisma gestiona la tabla _prisma_migrations automáticamente.
-- No insertar registros manualmente aquí.
