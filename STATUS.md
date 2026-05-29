# Estado del Proyecto — EMR Veterinaria

> Última actualización: 29 de mayo 2026

---

## Resumen ejecutivo

**Stack:** Turborepo · NestJS 10 · Next.js 15 App Router · PostgreSQL 16 + RLS · Redis 7 · BullMQ · shadcn/ui

El backend está prácticamente completo con lógica real en todos los módulos. El frontend tiene la estructura correcta pero varios módulos no tienen UI implementada. No hay Dockerfiles ni pipeline de deploy.

**Estimación para MVP desplegable:** ~15 horas de trabajo.

---

## Backend — apps/api

| Módulo | Endpoints | Lógica | Estado |
|--------|-----------|--------|--------|
| **Auth** | login, refresh, logout, me | JWT rotation, bcrypt, reuse detection | ✅ Completo |
| **Tenants** | CRUD | Provisioning automático (crea tenant + admin en transacción) | ✅ Completo |
| **Users** | CRUD | Hash password, validación email único por tenant | ✅ Completo |
| **Owners** | CRUD | Soft-delete, relación opcional con User | ✅ Completo |
| **Pets** | CRUD | Incluye últimas 5 historias + próximas 3 citas en findOne | ✅ Completo |
| **Appointments** | CRUD | Validación conflictos de horario por vet, 7 estados, 9 tipos | ✅ Completo |
| **Medical Records** | CRUD | Transacción: actualiza peso mascota si viene en physicalExam; solo el vet autor puede editar | ✅ Completo |
| **Storage** | upload, presigned URLs, delete | S3 / R2 / MinIO local | ✅ Completo |
| **Notifications** | enqueue email/push | Infraestructura Bull lista, procesadores son stubs | ⚠️ Parcial |

**Infraestructura transversal:**
- `ResponseInterceptor` — Envuelve todas las respuestas en `{ data, meta, error }`
- `HttpExceptionFilter` — Errores estructurados consistentes
- `AuditInterceptor` — Log de acciones en tabla `AuditLog`
- `TenantMiddleware` — Resolución de tenant desde subdomain o header `X-Tenant-ID`
- `RolesGuard` + `JwtAuthGuard` + `TenantGuard` — Seguridad por capas
- Swagger en `/docs` (solo development)

---

## Base de datos — packages/database

**9 modelos:** Tenant, User, Owner, Pet, Vet, Appointment, MedicalRecord, Attachment, AuditLog

**Esquema relacional:**
```
Tenant
├── Users (CASCADE)
│   └── Vet (extensión 1:1)
├── Owners
│   └── Pets
│       ├── MedicalRecords → Attachments
│       └── Appointments → MedicalRecord (1:1 opcional)
└── AuditLogs
```

**Enumeraciones:** UserRole (5), Species (17), Gender (3), AppointmentStatus (7), AppointmentType (9+1), TenantPlan (4)

**Migraciones:** 1 migración inicial completa con índices y RLS.
**Roles PostgreSQL:** `emr_app` (RLS activo), `emr_migrator` (BYPASSRLS para Prisma).

---

## Frontend — apps/web

| Página | Ruta | Datos reales | Crear | Editar | Estado |
|--------|------|:---:|:---:|:---:|--------|
| Login | `/login` | ✅ | — | — | ✅ Completo |
| Dashboard | `/` | ⚠️ Fallback mock | — | — | ⚠️ Parcial (endpoint `/dashboard/stats` no existe en API) |
| Mascotas | `/pets` | ✅ | ✅ | ❌ | ⚠️ Crear requiere UUID de propietario manual |
| Propietarios | `/owners` | ✅ | ❌ | ❌ | ⚠️ Solo lectura |
| Citas | `/appointments` | ✅ | ✅ | ❌ | ✅ Calendario semanal funcional |
| Historial médico | `/medical-records` | ❌ | ❌ | ❌ | ❌ Placeholder vacío |
| Configuración | `/settings` | — | — | — | ⚠️ Solo editor de tema |
| Olvidé contraseña | `/forgot-password` | ❌ | — | — | ⚠️ UI sí, endpoint no existe |

**Componentes transversales:** DataTable (paginación, búsqueda, sorting), PageHeader, EmptyState, StatCard, ThemeProvider con CSS variables por tenant.

**Auth client:** `lib/auth.ts` + `lib/api.ts` — JWT en localStorage (inseguro, suficiente para MVP), refresh automático en 401, serialización para evitar múltiples refreshes concurrentes.

**Problema de protección de rutas:** No hay `middleware.ts`. Las rutas del dashboard son accesibles sin token; el redirect a login ocurre solo cuando la llamada a la API devuelve 401.

---

## Infraestructura

| Componente | Estado |
|-----------|--------|
| `docker-compose.yml` (dev) | ✅ Postgres, Redis, MinIO, Mailhog con healthchecks |
| `.github/workflows/ci.yml` | ✅ Lint, type-check, test, build — **sin deploy** |
| Dockerfile (API) | ❌ No existe |
| Dockerfile (Web) | ❌ No existe |
| Nginx / reverse proxy | ❌ No existe |
| Variables de entorno producción | ❌ Solo `.env.example` |
| Seeding de datos | ❌ No existe |

---

## Qué falta para el MVP

### Bloqueadores críticos (sin esto no se puede desplegar)

- [ ] **Dockerfiles** — Multistage para API (NestJS) y Web (Next.js)
- [ ] **Docker Compose producción** — Con variables reales y sin herramientas de dev
- [ ] **Middleware de rutas** — `apps/web/src/middleware.ts` para proteger `/dashboard` y redirigir si no hay token
- [ ] **Seeding inicial** — Script para crear el primer tenant + SUPER_ADMIN al desplegar
- [ ] **Variables de entorno prod** — JWT secrets fuertes, DATABASE_URL real, dominio CORS

### Funcionalidades faltantes para que sea usable

- [ ] **Historial médico** — Tabla + formulario en frontend (backend 100% listo)
- [ ] **Crear/editar propietarios** — Formulario falta en frontend
- [ ] **Selector de propietario en form de mascota** — Reemplazar UUID manual por dropdown
- [ ] **Endpoint `/dashboard/stats`** — Implementar en API o eliminar el fallback mock
- [ ] **Forgot password** — Endpoint en API + envío de email

### Deuda técnica (post-MVP)

- [ ] httpOnly cookies en lugar de localStorage para tokens
- [ ] Procesadores reales de notificaciones (email con Resend/SendGrid, push)
- [ ] RLS activo en PostgreSQL (el schema lo soporta, falta activar con `set_tenant_id`)
- [ ] Formulario de edición de mascotas y citas
- [ ] Tests E2E
- [ ] Mobile app (Expo — falla con pnpm/Metro en Windows por ahora)

---

## Credenciales de desarrollo local

```
URL web:         http://localhost:3000
URL API:         http://localhost:3001/v1
Swagger:         http://localhost:3001/docs
MinIO UI:        http://localhost:9001  (emr_minio / emr_minio_password)
Mailhog UI:      http://localhost:8025

PostgreSQL:      localhost:5432  (emr / emr_dev_password)
Redis:           localhost:6379  (password: emr_redis_password)

Tenant dev:      demo-clinica  (header X-Tenant-ID en modo development)
```

---

## Comandos útiles

```bash
# Infra
docker compose up -d

# Dev
pnpm --filter @emr/api dev
pnpm --filter @emr/web dev

# DB
pnpm db:migrate
pnpm db:studio

# Build
pnpm build

# CI local
pnpm lint && pnpm type-check && pnpm test
```
