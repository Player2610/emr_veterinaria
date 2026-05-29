# EMR Veterinaria

SaaS para gestión de clínicas veterinarias + app móvil para dueños de mascotas.

## Stack

| Capa | Tecnología |
|------|-----------|
| Monorepo | Turborepo + pnpm workspaces |
| Backend | NestJS 10 + TypeScript |
| Base de datos | PostgreSQL 16 + Prisma 6 + Row-Level Security |
| Caché / Colas | Redis 7 + BullMQ |
| Frontend web | Next.js 15 + TailwindCSS + shadcn/ui |
| App móvil | Expo 52 + React Native + NativeWind |
| Storage | S3 / Cloudflare R2 (MinIO en dev) |
| Auth | JWT (access 15min + refresh 7d rotatorio) |

## Estructura del monorepo

```
.
├── apps/
│   ├── api/       NestJS — API REST + WebSocket
│   ├── web/       Next.js — SaaS web para clínicas
│   └── mobile/    Expo — App para dueños de mascotas
├── packages/
│   ├── shared/    Tipos TypeScript compartidos
│   ├── database/  Prisma schema + migraciones
│   ├── ui/        Componentes UI compartidos
│   └── config/    Configs reutilizables (tsconfig, tailwind, eslint)
└── docker/        Configs de infraestructura local
```

## Inicio rápido

### Prerrequisitos

- Node.js >= 20
- pnpm >= 9
- Docker + Docker Compose

### 1. Infraestructura local

```bash
docker compose up -d
```

Servicios levantados:
- PostgreSQL en `localhost:5432`
- Redis en `localhost:6379`
- MinIO (S3 local) en `localhost:9000` (UI: `localhost:9001`)
- Mailhog (SMTP local) en `localhost:1025` (UI: `localhost:8025`)

### 2. Dependencias

```bash
pnpm install
```

### 3. Variables de entorno

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 4. Base de datos

```bash
# Generar Prisma Client
pnpm db:generate

# Correr migraciones
pnpm --filter @emr/database db:migrate:dev

# Seed de datos de desarrollo
pnpm --filter @emr/database db:seed
```

### 5. Desarrollo

```bash
# Levantar todo en paralelo
pnpm dev

# O por separado:
pnpm --filter @emr/api dev       # API en :3001
pnpm --filter @emr/web dev       # Web en :3000
pnpm --filter @emr/mobile dev    # Expo
```

## Multi-tenancy

Cada clínica es un **tenant** aislado. El aislamiento opera en dos capas:

1. **Aplicación**: el JWT incluye `tenantId`; todos los servicios filtran por él.
2. **Base de datos**: Row-Level Security en PostgreSQL. El backend ejecuta `SELECT set_tenant_id($1)` al inicio de cada request para activar las políticas RLS.

La resolución del tenant en el frontend web se hace por **subdominio** (`miClinica.emrvet.com`) en producción, o por header `X-Tenant-ID` en desarrollo.

## Theming por tenant

Cada clínica puede personalizar su identidad visual (colores, logo, tipografía) sin recompilar. El `TenantTheme` se carga al iniciar sesión y se aplica via **CSS custom properties** en runtime.

Para editar el tema de una clínica: `Settings → Tema` en el panel web.

## Documentación de la API

Con la API corriendo: [http://localhost:3001/docs](http://localhost:3001/docs)

## Roles

| Rol | Descripción |
|-----|------------|
| `SUPER_ADMIN` | Acceso total al sistema (nosotros) |
| `TENANT_ADMIN` | Dueño/admin de una clínica |
| `VET` | Veterinario de la clínica |
| `ASSISTANT` | Asistente de la clínica |
| `PET_OWNER` | Dueño de mascota (solo app móvil) |
