# Plan de Deploy — MVP gratis para validación / demo a cliente

> Objetivo: desplegar el EMR en una **URL pública gratuita** para mostrarle a un cliente y validar la idea, sin gastar dinero.

## Decisiones

- **Stack de deploy (todo free tier):** Vercel (web) · Render (API) · Neon (Postgres) · Upstash (Redis).
- **Alcance:** Core + Historial médico — login, dashboard con datos reales, mascotas/propietarios/citas con alta y edición, e historial médico en frontend. Poblado con datos demo realistas.
- **Onboarding:** seeding manual con el `seed.ts` existente (clínica `demo-clinica`). Sin signup público.

## Hallazgos que condicionan el plan

- **Neon funciona con una sola connection string.** `PrismaService.setTenantContext` usa `SET app.current_tenant_id` (variable de sesión, no roles PG); las policies RLS usan `current_tenant_id()` de forma permisiva y el rol owner de Neon queda exento. No se necesitan los roles `emr_app`/`emr_migrator` del `docker/postgres/init.sql`.
- **El `seed.ts` ya crea la demo completa** (`packages/database/src/seed.ts`): clínica `demo-clinica`, 5 usuarios, 3 dueños, 5 mascotas, 6 citas, 2 historias clínicas con diagnósticos/tratamientos reales.
  - Credenciales: `admin@demo-clinica.com` / `demo1234!` · vet `dra.garcia@demo-clinica.com` / `demo1234!`.
- **Redis (Upstash)** compatible con la config `host/port/password` actual añadiendo TLS.
- **Tenant por header**: `NEXT_PUBLIC_TENANT_RESOLUTION=header` + `X-Tenant-ID: demo-clinica`; el guard resuelve por `id OR slug`. ✔ encaja con el seed.
- **Backend de historial médico 100% listo** (`GET /medical-records?petId=`, `GET /:id`, `POST` rol VET, `PATCH /:id`). Falta solo el frontend.

---

## Fase 1 — Completar features faltantes (código local)

Que no haya huecos visibles cuando el cliente explore.

1. **Historial médico (frontend)** — pieza grande.
   - Hooks en `apps/web/src/hooks/use-api.ts`: `useMedicalRecords(petId?)`, `useMedicalRecord(id)` (reusar patrón `useApi`). Interface `MedicalRecord` según shape del seed.
   - Reescribir `apps/web/src/app/(dashboard)/medical-records/page.tsx` (hoy placeholder): tabla con `DataTable` (mascota, motivo, vet, fecha) + filtro por mascota.
   - `components/medical-records/medical-record-detail.tsx`: detalle (diagnósticos, tratamientos, prescripciones) en Dialog.
   - `components/medical-records/medical-record-form.tsx`: crear registro (`POST /medical-records`) para rol VET. Patrón de `appointment-form.tsx`.

2. **Pet form — dropdown de propietario** (`apps/web/src/components/pets/pet-form.tsx:137-146`): reemplazar input de UUID manual por `<select>` poblado con `useOwners()`.

3. **Propietarios — alta/edición** (`apps/web/src/app/(dashboard)/owners/page.tsx`): crear `components/owners/owner-form.tsx` (`POST /owners`, `PATCH /owners/:id`) y conectar el botón "Nuevo propietario" a un Dialog. Patrón de `pet-form.tsx`.

4. **Dashboard con datos reales** — endpoint nuevo. El front llama `GET /dashboard/stats` (`use-api.ts:137`) que no existe. Crear `apps/api/src/modules/dashboard/` (controller + service) con `count`/`groupBy` de Prisma, protegido por `JwtAuthGuard + TenantGuard`; registrar en `app.module.ts`. Quitar el `MOCK_STATS` del front.

5. **Protección de rutas** — los tokens están en `localStorage`, así que no sirve middleware server-side. Guard **client-side** en `app/(dashboard)/layout.tsx`: verificar `isAuthenticated()` en `useEffect` y redirigir a `/login`. (Migrar a cookies httpOnly queda como deuda post-MVP.)

---

## Fase 2 — Preparar el código para el deploy ✅

1. **Health endpoint** ✅ — `GET /health` (sin prefix, sin guards). `apps/api/src/health/health.controller.ts`.
2. **CORS por entorno** ✅ — `main.ts` ya lee `CORS_ORIGINS`; setear con el dominio de Vercel en las env vars de Render.
3. **Redis TLS** ✅ — `redis.config.ts` expone `tls: REDIS_TLS==='true'`; `notifications.module.ts` lo aplica condicionalmente.
4. **Dockerfile API** ✅ — `apps/api/Dockerfile` multistage (deps → build → runner `node dist/main`).
5. **Env del front** ✅ — Ver `apps/web/.env.production.example` para las vars a configurar en Vercel.
6. **Migrate/seed en prod** — Comandos:

```bash
# 1. Aplicar migraciones (una sola vez al crear la DB)
DATABASE_URL="postgresql://..." pnpm --filter @emr/database db:migrate

# 2. Poblar con datos demo
DATABASE_URL="postgresql://..." pnpm --filter @emr/database db:seed
```

> ⚠️ El `seed.ts` usa `create()`, no `upsert()`. Ejecutar una sola vez. Si hay que re-seedar, hacer `prisma migrate reset` primero o borrar los datos manualmente.

---

## Fase 3 — Provisionar y desplegar (de adentro hacia afuera)

1. **Neon (Postgres):** crear proyecto → connection string. Ejecutar `prisma migrate deploy` (aplica `00001_init` + extensiones + RLS) y `pnpm --filter @emr/database db:seed`. Verificar.
2. **Upstash (Redis):** crear base → host/port/password. (Opcional diferir: notificaciones son stubs, pero sin Redis hay logs de reintento.)
3. **Render (API):** Web Service desde repo (root `apps/api` o Docker). Env: `DATABASE_URL` (Neon), `REDIS_HOST/PORT/PASSWORD` + `REDIS_TLS=true`, `JWT_SECRET`/`JWT_REFRESH_SECRET` (nuevos fuertes), `CORS_ORIGINS` (Vercel), `NODE_ENV=production`, `API_PREFIX=v1`. Anotar URL `https://<api>.onrender.com`.
4. **Vercel (Web):** importar repo, root `apps/web`, Next.js (detecta Turborepo). Env: `NEXT_PUBLIC_API_URL=https://<api>.onrender.com/v1`, `NEXT_PUBLIC_TENANT_RESOLUTION=header`, `NEXT_PUBLIC_DEV_TENANT_ID=demo-clinica`, `NEXT_PUBLIC_ENABLE_THEME_EDITOR=true`. Deploy → `https://<app>.vercel.app`.
5. **Anti cold-start:** cron-job.org (gratis) → GET a `/health` cada ~10 min (Render free duerme tras 15 min, ~50s de arranque en frío).

---

## Fase 4 — Verificación end-to-end

1. `https://<app>.vercel.app/login` → entrar con `admin@demo-clinica.com` / `demo1234!`.
2. Recorrer Dashboard (métricas reales) · Mascotas (listado + crear con dropdown de dueño) · Propietarios (crear/editar) · Citas (calendario con 6 citas) · Historial médico (ver 2 historias; crear una como vet `dra.garcia@demo-clinica.com`).
3. Recargar ruta del dashboard sin sesión → redirige a `/login`.
4. Confirmar primer request tras inactividad (cold start) y que el ping lo mantiene caliente.
5. Probar la URL desde otra red/dispositivo.

---

## Deuda post-MVP (fuera de alcance ahora)

- Tokens en `localStorage` → cookies httpOnly + middleware server-side real.
- RLS efectivo con rol de app dedicado (hoy el owner de Neon queda exento).
- Procesadores reales de notificaciones (email Resend/SendGrid), forgot-password.
- App móvil Expo (falla con pnpm/Metro en Windows).
- Deploy automático en `.github/workflows/ci.yml` (hoy solo lint/test/build).
