# EMR Veterinaria — Arquitectura y bloques funcionales

Este documento explica qué hay construido, cómo están relacionados los archivos y qué funcionalidad EMR implementa cada bloque. Es el mapa para entender el sistema antes de seguir desarrollando.

---

## Índice

1. [Infraestructura base — Monorepo, Docker, CI/CD](#1-infraestructura-base)
2. [Base de datos y multi-tenancy — PostgreSQL + RLS](#2-base-de-datos-y-multi-tenancy)
3. [API REST — Bootstrap y capas transversales](#3-api-rest-bootstrap-y-capas-transversales)
4. [Autenticación y autorización — JWT + RBAC](#4-autenticación-y-autorización)
5. [Gestión de clientes — Propietarios y Mascotas](#5-gestión-de-clientes)
6. [Agenda médica — Citas](#6-agenda-médica)
7. [Historia clínica — Registros médicos](#7-historia-clínica)
8. [Notificaciones asíncronas — Email y Push](#8-notificaciones-asíncronas)
9. [Almacenamiento de archivos — S3/MinIO](#9-almacenamiento-de-archivos)
10. [Frontend web — Next.js, theming y módulos](#10-frontend-web)
11. [Aplicación móvil — Expo / React Native](#11-aplicación-móvil)
12. [Paquetes compartidos](#12-paquetes-compartidos)
13. [Lo que falta / próximos pasos](#13-lo-que-falta)

---

## 1. Infraestructura base

### Objetivo EMR
Que el proyecto pueda vivir en un repositorio único (multi-app), arrancar en local con un solo comando y desplegarse automáticamente en CI.

### Estructura del monorepo

```
EMR_Veterinaria/
├── apps/
│   ├── api/          ← NestJS (backend REST)
│   ├── web/          ← Next.js 15 (panel de gestión)
│   └── mobile/       ← Expo 52 (app del dueño de mascota)
├── packages/
│   ├── database/     ← Prisma schema + migraciones SQL
│   ├── shared/       ← Tipos TypeScript compartidos (sin runtime deps)
│   └── config/
│       ├── tsconfig/ ← tsconfig base reutilizable
│       └── tailwind/ ← tailwind.config.ts reutilizable
└── pnpm-workspace.yaml
```

**Gestión de dependencias**: pnpm workspaces. Todos los `apps/*`, `packages/*` y `packages/config/*` son paquetes independientes que se referencian entre sí con `@emr/...`.

### Docker (desarrollo local)

Archivo: `docker-compose.yml`

| Servicio | Puerto | Propósito |
|---|---|---|
| `emr_postgres` | 5432 | Base de datos principal (PostgreSQL 16) |
| `emr_redis` | 6379 | Cola de jobs (BullMQ) y caché |
| `emr_minio` | 9000 / 9001 | Almacenamiento S3-compatible para radiografías, PDFs, etc. |
| `emr_mailhog` | 1025 / 8025 | Captura emails en desarrollo (bandeja en `localhost:8025`) |

Arrancar: `docker compose up -d`

**Nota**: si hay un PostgreSQL local corriendo en el puerto 5432, hay conflicto. En ese caso cambiar el mapeo a `'5433:5432'` en `docker-compose.yml` y actualizar `DATABASE_URL` en `.env`.

### CI/CD

Archivo: `.github/workflows/ci.yml` — 4 jobs en paralelo:

| Job | Qué hace |
|---|---|
| `lint-and-typecheck` | ESLint + `tsc --noEmit` en todos los paquetes |
| `test-api` | Tests de integración del API contra Postgres + Redis reales (no mocks) |
| `build-web` | `next build` de la app web |
| `build-api` | `nest build` del API |

---

## 2. Base de datos y multi-tenancy

### Objetivo EMR
Una sola instancia de base de datos sirve a múltiples clínicas veterinarias. Los datos de cada clínica son completamente invisibles para las otras, a nivel de base de datos (no solo a nivel de aplicación).

### Cómo funciona el aislamiento (RLS)

**Archivo clave**: `packages/database/prisma/migrations/00001_init/migration.sql`

El mecanismo es **Row-Level Security (RLS) de PostgreSQL**:

1. Cada tabla tiene una columna `tenantId` (el ID de la clínica).
2. PostgreSQL tiene una política activa en cada tabla:
   ```sql
   CREATE POLICY "tenant_isolation" ON pets
     USING ("tenantId" = current_tenant_id());
   ```
3. `current_tenant_id()` lee la variable de sesión `app.current_tenant_id`.
4. Antes de cada operación, la app establece esa variable:
   ```sql
   SET LOCAL app.current_tenant_id = 'cln_xxxx';
   ```
5. Resultado: **PostgreSQL filtra automáticamente** — un `SELECT * FROM pets` solo devuelve las mascotas del tenant activo, aunque no haya cláusula `WHERE`.

**Rol de base de datos**: `docker/postgres/init.sql` crea dos roles:
- `emr_app` — rol normal, RLS activo, usado por la app en producción.
- `emr_migrator` — rol con `BYPASSRLS`, solo usado para correr migraciones.

### Servicio Prisma (puente entre app y RLS)

**Archivo**: `apps/api/src/prisma/prisma.service.ts`

Tres métodos clave:

```typescript
// Establece el tenant para la sesión actual (consultas sueltas)
await prisma.setTenantContext(tenantId);

// Garantizado dentro de una transacción (SET LOCAL — más seguro)
const result = await prisma.withTenant(tenantId, async (tx) => {
  return tx.pet.create({ data: {...} });
});

// Conveniencia — alias de setTenantContext
const client = prisma.prismaForTenant(tenantId);
```

### Modelos de datos

**Archivo**: `packages/database/prisma/schema.prisma`

```
Tenant (clínica)
 ├── User (staff: veterinario, asistente, admin) / también PET_OWNER
 │    └── Vet (perfil extendido del veterinario)
 ├── Owner (propietario de mascota, puede estar vinculado a un User)
 │    └── Pet (mascota/paciente)
 │         ├── Appointment (cita médica)
 │         │    └── MedicalRecord (historia clínica)
 │         │         └── Attachment (archivos adjuntos)
 └── AuditLog (registro de acciones sensibles)
```

Campos relevantes por modelo:

**Pet** (paciente): `name`, `species` (17 especies: DOG, CAT, BIRD, RABBIT, HORSE, etc.), `breed`, `gender`, `birthDate`, `weight` (kg con 2 decimales), `microchipId`, `photoUrl`, `isDeceased`.

**Appointment** (cita): `startTime`, `endTime`, `type` (GENERAL_CHECKUP, VACCINATION, SURGERY, EMERGENCY, etc.), `status` (PENDING_CONFIRMATION → CONFIRMED → IN_PROGRESS → COMPLETED, también CANCELLED, NO_SHOW, RESCHEDULED).

**MedicalRecord** (historia clínica): `chiefComplaint` (motivo de consulta), `anamnesis`, `physicalExam` (JSON: peso, temperatura, frecuencia cardíaca, etc.), `diagnoses` (array JSON: código, descripción, isPrimary), `treatments` (array JSON), `prescriptions` (array JSON: medicamento, dosis, instrucciones), `followUpDate`.

---

## 3. API REST — Bootstrap y capas transversales

### Objetivo EMR
El API centraliza toda la lógica de negocio. Cualquier cliente (web, móvil, integraciones externas) interactúa solo a través de él.

### Arranque

**Archivo**: `apps/api/src/main.ts`

El API arranca en `http://localhost:3001/v1` con estas capas activas globalmente:

| Capa | Qué hace |
|---|---|
| `Helmet` | Headers de seguridad HTTP (CSP habilitado en producción) |
| `CORS` | Permite el header `x-tenant-id` además de `Authorization` |
| `ValidationPipe` | Valida todos los DTOs entrantes; rechaza propiedades desconocidas |
| `HttpExceptionFilter` | Estandariza todos los errores en `{ error, message, statusCode, timestamp }` |
| `ResponseInterceptor` | Envuelve todas las respuestas en `{ data, meta }` |
| `AuditInterceptor` | Loguea `[tenantId] userId METHOD /ruta +Xms` para cada request |
| Swagger | Documentación interactiva en `http://localhost:3001/docs` (solo dev) |

### Módulos registrados

**Archivo**: `apps/api/src/app.module.ts`

```
AppModule
 ├── ConfigModule      ← Variables de entorno (app, db, redis, jwt, storage)
 ├── ThrottlerModule   ← Rate limiting: 100 req / 60s por defecto
 ├── AuthModule        ← Login, refresh, logout, /me
 ├── TenantsModule     ← Alta de clínicas (solo SUPER_ADMIN)
 ├── UsersModule       ← Gestión de usuarios dentro del tenant
 ├── OwnersModule      ← Propietarios de mascotas
 ├── PetsModule        ← Mascotas / pacientes
 ├── AppointmentsModule← Agenda de citas
 ├── MedicalRecordsModule ← Historias clínicas
 ├── NotificationsModule  ← Colas de email y push (BullMQ)
 └── StorageModule        ← Subida de archivos a S3/MinIO
```

**Middleware global**: `TenantMiddleware` (`apps/api/src/common/middleware/tenant.middleware.ts`) extrae el tenant de:
1. Subdominio: `miclínica.api.ejemplo.com` → tenant = `miclínica`
2. Header de fallback: `x-tenant-id: miclínica` (útil en desarrollo y Swagger)

---

## 4. Autenticación y autorización

### Objetivo EMR
Solo usuarios autenticados acceden al sistema. Cada rol tiene permisos distintos: el veterinario puede crear historias clínicas, el asistente puede gestionar citas, el dueño solo ve su mascota.

### Flujo de autenticación

**Archivo clave**: `apps/api/src/modules/auth/auth.service.ts`

```
POST /v1/auth/login  (con header x-tenant-id)
 └── 1. Busca el tenant por slug o id
 └── 2. Activa RLS para ese tenant
 └── 3. Busca el usuario por email + tenantId
 └── 4. Compara contraseña con bcrypt
 └── 5. Genera par de tokens JWT (access 15min + refresh 7d)
 └── 6. Guarda hash bcrypt del refresh token en la BD
 └── Devuelve: { accessToken, refreshToken, expiresIn }
```

**Refresh token rotation**: Cada vez que se usa el refresh token, se genera un par nuevo. Si se detecta reutilización del token anterior (posible robo), se invalidan TODAS las sesiones del usuario (`refreshTokenHash = null`).

**Logout**: Simplemente borra el `refreshTokenHash` de la BD. El access token existente expirará solo en 15 minutos.

### Estrategias JWT

- `apps/api/src/modules/auth/strategies/jwt.strategy.ts` — valida el access token en cada request protegido.
- `apps/api/src/modules/auth/strategies/jwt-refresh.strategy.ts` — valida el refresh token en `POST /v1/auth/refresh`.

### Control de acceso por rol (RBAC)

**Archivo**: `apps/api/src/common/guards/roles.guard.ts`

Los roles disponibles (definidos en `packages/shared`):

| Rol | Quién es |
|---|---|
| `SUPER_ADMIN` | Administrador de la plataforma SaaS (no pertenece a ninguna clínica) |
| `TENANT_ADMIN` | Dueño/administrador de una clínica específica |
| `VET` | Veterinario — puede crear y editar historias clínicas |
| `ASSISTANT` | Asistente clínico — gestiona citas y pacientes pero no historias clínicas |
| `PET_OWNER` | Dueño de mascota — accede solo desde la app móvil |

Uso en controladores:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.VET, UserRole.ASSISTANT)
@Get()
findAll() { ... }
```

### Decoradores utilitarios

- `@CurrentUser()` — extrae el usuario del JWT en el parámetro del método (`apps/api/src/common/decorators/user.decorator.ts`).
- `@TenantId()` — extrae el tenantId del request (`apps/api/src/common/decorators/tenant.decorator.ts`).
- `@Roles(...)` — marca los roles permitidos en un endpoint (`apps/api/src/common/decorators/roles.decorator.ts`).

---

## 5. Gestión de clientes

### Objetivo EMR
Registrar y mantener el padrón de propietarios y sus mascotas. Cada mascota es el "paciente" central del EMR.

### Propietarios

**Archivos**: `apps/api/src/modules/owners/`

Endpoints: `GET /v1/owners`, `POST /v1/owners`, `GET /v1/owners/:id`, `PATCH /v1/owners/:id`

Un **Owner** representa al cliente de la clínica (el humano que trae a la mascota). Campos: `firstName`, `lastName`, `phone` (obligatorio), `email` (opcional), `address`, `notes`.

El Owner puede estar vinculado a un `User` con rol `PET_OWNER` — esto conecta la cuenta de la app móvil con su perfil en la clínica.

### Mascotas / Pacientes

**Archivos**: `apps/api/src/modules/pets/`

Endpoints: `GET /v1/pets`, `POST /v1/pets`, `GET /v1/pets/:id`, `PATCH /v1/pets/:id`

Una **Pet** es el paciente del sistema. Campos relevantes para EMR:
- `species` — 17 valores (perro, gato, pájaro, conejo, hámster, cobaya, hurón, tortuga, serpiente, lagarto, pez, caballo, vaca, cerdo, oveja, cabra, otro)
- `birthDate` — para calcular edad y alertas de vacunas
- `weight` — actualizado automáticamente en cada historia clínica si se registra en el examen físico
- `microchipId` — identificación única del paciente
- `isDeceased` — el historial se conserva, el paciente se marca como fallecido
- `photoUrl` — foto del paciente

El endpoint `GET /v1/pets/:id` devuelve también el historial de citas y los últimos registros médicos.

---

## 6. Agenda médica

### Objetivo EMR
Gestionar la disponibilidad de la clínica, asignar citas a veterinarios y evitar solapamientos.

### Archivos

`apps/api/src/modules/appointments/`

### Ciclo de vida de una cita

```
PENDING_CONFIRMATION → CONFIRMED → IN_PROGRESS → COMPLETED
                   ↘ CANCELLED
                   ↘ NO_SHOW
                   ↘ RESCHEDULED
```

Una cita recién creada siempre empieza en `PENDING_CONFIRMATION`.

### Validaciones de negocio (en `appointments.service.ts`)

1. **No se pueden crear citas en el pasado** — `startTime < now()` → error.
2. **La hora de fin debe ser posterior a la de inicio**.
3. **Detección de conflictos para el veterinario** — antes de crear, busca si hay otra cita del mismo veterinario que se solape en horario (excluye las canceladas y no-shows). El algoritmo verifica los tres casos posibles de solapamiento:
   - La nueva cita empieza dentro de una existente.
   - La nueva cita termina dentro de una existente.
   - La nueva cita engloba completamente a una existente.
4. **No se puede cancelar una cita ya completada**.

### Campos de una cita

`petId`, `ownerId`, `vetId` (opcional — puede ser sin veterinario asignado), `title`, `notes`, `type` (GENERAL_CHECKUP, VACCINATION, SURGERY, EMERGENCY, etc.), `startTime`, `endTime`, `status`.

Una cita puede tener asociado un único `MedicalRecord` (la historia clínica generada durante esa visita).

---

## 7. Historia clínica

### Objetivo EMR
Este es el núcleo del sistema. Registrar la información médica de cada visita de forma estructurada y auditable.

### Archivos

`apps/api/src/modules/medical-records/`

### Estructura de un registro (formato tipo SOAP)

| Campo | Tipo | Descripción |
|---|---|---|
| `chiefComplaint` | `String` | Motivo de consulta (obligatorio) |
| `anamnesis` | `String?` | Antecedentes, historia del problema |
| `physicalExam` | `JSON` | Examen físico: `{ weight, temperature, heartRate, respiratoryRate, bloodPressure, ... }` |
| `diagnoses` | `JSON[]` | Array de diagnósticos: `[{ code, description, isPrimary }]` |
| `treatments` | `JSON[]` | Tratamientos: `[{ name, dose, frequency, duration, route }]` |
| `prescriptions` | `JSON[]` | Prescripciones: `[{ drug, dose, instructions, durationDays }]` |
| `notes` | `String?` | Notas adicionales del veterinario |
| `followUpDate` | `DateTime?` | Fecha de próxima revisión |

### Comportamientos especiales

- **Actualización automática de peso**: Al crear un registro médico, si `physicalExam.weight` está presente, el campo `weight` de la mascota se actualiza automáticamente en la misma transacción.

- **Solo el veterinario autor puede editar su propio registro**: Si `record.vetId !== requestingVetId` → error 403.

- **Ligado a una cita**: `appointmentId` opcional — si la visita vino de una cita agendada, los dos quedan vinculados.

- **Adjuntos**: El modelo `Attachment` guarda archivos (radiografías, análisis de laboratorio, fotos) vinculados a un registro médico. Se almacenan en S3/MinIO (ver bloque 9).

### Auditoría

Modelo `AuditLog`: cada acción sensible (leer un historial, crear, editar, eliminar) puede generar una entrada inmutable con `userId`, `action`, `resource`, `resourceId` y metadatos (IP, cambios antes/después). El `AuditInterceptor` registra automáticamente en logs; la persistencia en BD puede activarse por módulo.

---

## 8. Notificaciones asíncronas

### Objetivo EMR
Enviar emails (confirmación de cita, recordatorio, resultado de laboratorio) y notificaciones push al dueño de la mascota, sin bloquear los requests de la API.

### Arquitectura

**Archivos**: `apps/api/src/modules/notifications/`

```
API request → NotificationsService.sendEmail() / sendPush()
                └── BullMQ (cola en Redis)
                      └── EmailProcessor / PushProcessor (workers)
                            └── SMTP (Mailhog en dev, SendGrid/SES en prod)
                            └── Expo Push Notifications (para móvil)
```

La ventaja de la cola: si el servidor SMTP está caído, el job se reintenta automáticamente (3 intentos con backoff exponencial de 2 segundos). El API responde al cliente inmediatamente sin esperar.

### Métodos de conveniencia

```typescript
// Notificar al admin cuando se agenda una cita
notificationsService.notifyAppointmentBooked({ adminEmail, petName, vetName, scheduledAt, tenantId });

// Recordatorio al dueño el día anterior
notificationsService.sendAppointmentReminder({ ownerEmail, petName, scheduledAt, tenantId });
```

### Jobs

Cada job tiene: `templateId` (identifica la plantilla de email), `variables` (datos para rellenar la plantilla), `to` (destinatario), `tenantId`.

---

## 9. Almacenamiento de archivos

### Objetivo EMR
Guardar radiografías, resultados de análisis, fotos de pacientes y cualquier documento adjunto a una historia clínica, con acceso seguro por URL temporal.

### Archivos

`apps/api/src/modules/storage/storage.service.ts`

### Cómo funciona

**En desarrollo**: MinIO corriendo en Docker (reemplazo local de S3, consola en `localhost:9001`).  
**En producción**: AWS S3 o Cloudflare R2 (compatible con el SDK de S3).

La configuración (región, credenciales, bucket, endpoint) viene de variables de entorno a través del `ConfigService`.

### Operaciones disponibles

```typescript
// Subir un archivo desde el servidor
const result = await storageService.upload({
  buffer,
  originalName: 'radiografia.jpg',
  contentType: 'image/jpeg',
  tenantId,
  folder: 'medical-records',
});
// La clave en S3 tiene formato: tenantId/medical-records/<uuid>.jpg

// URL de descarga con expiración (por defecto 1 hora)
const url = await storageService.getPresignedDownloadUrl(key, 3600);

// URL de subida directa desde el cliente (evita pasar el archivo por el servidor)
const { uploadUrl, key } = await storageService.getPresignedUploadUrl({
  tenantId,
  contentType: 'application/pdf',
  folder: 'lab-results',
});

// Eliminar
await storageService.delete(key);
```

El **aislamiento multi-tenant** en S3 se consigue con el prefijo de la clave: `tenantId/carpeta/uuid.ext`. Cada clínica tiene su propio "directorio virtual".

---

## 10. Frontend web

### Objetivo EMR
Panel de gestión para el personal de la clínica (veterinarios, asistentes, administradores). Totalmente personalizable visualmente para que cada clínica pueda tener su propia identidad visual.

### Tecnología

Next.js 15 (App Router), React 19, TailwindCSS v3, shadcn/ui.

### Estructura de rutas

```
/                    ← Dashboard (estadísticas de la clínica)
/(auth)/login        ← Página de login
/(auth)/forgot-password
/(dashboard)/pets    ← Listado de mascotas
/(dashboard)/pets/[id]   ← Perfil de mascota
/(dashboard)/owners  ← Propietarios
/(dashboard)/appointments ← Agenda de citas
/(dashboard)/medical-records ← Historiales clínicos
/(dashboard)/settings ← Configuración general
/(dashboard)/settings/theme ← Editor visual del tema
```

El layout `(dashboard)` incluye sidebar + header y solo es visible para usuarios autenticados.

### Sistema de temas (personalización visual)

**Archivo clave**: `apps/web/src/lib/theme.ts`

Cada clínica puede tener su propia combinación de colores, tipografía y radio de bordes. El sistema utiliza **35 variables CSS en formato HSL** (`--primary`, `--background`, `--sidebar-background`, etc.) mapeadas a un objeto TypeScript `TenantTheme`.

```typescript
// Aplicar el tema de la clínica sin recompilar nada
applyThemeToDOM(clinicTheme);

// Leer el tema actual del DOM
const current = readThemeFromDOM();
```

El tema se carga desde el campo `theme` del `Tenant` en la base de datos (JSON) y se aplica al `document.documentElement` vía CSS custom properties. **No requiere recompilar Tailwind** — todo funciona en tiempo de ejecución.

El **editor de tema** (`/settings/theme`) permite al administrador de la clínica ver y ajustar los colores en tiempo real desde el navegador.

### Sistema de módulos (extensibilidad)

**Archivo clave**: `apps/web/src/lib/registry.ts`

El sidebar y la navegación no están hardcodeados. Hay un `ModuleRegistry` singleton:

```typescript
// Un módulo de terceros puede registrarse así:
moduleRegistry.register({
  id: 'laboratorio',
  navItems: [{ id: 'lab', label: 'Laboratorio', href: '/lab', icon: Flask }],
  routes: [{ path: '/lab', title: 'Laboratorio', protected: true }],
});
```

El sidebar lee `moduleRegistry.getNavItems()` y muestra automáticamente los nuevos ítems. Esto permite añadir módulos funcionales (farmacia, telemedicina, facturación) sin tocar el código del núcleo.

El **módulo core** está pre-registrado con: Dashboard, Mascotas, Propietarios, Citas, Historial médico y Configuración.

### Dashboard

`apps/web/src/app/(dashboard)/page.tsx` — muestra 4 tarjetas de estadísticas (total mascotas, citas hoy, nuevos clientes, pendientes de pago) y un gráfico de barras CSS-only de citas por día. Usa datos de mock mientras la API no esté conectada.

---

## 11. Aplicación móvil

### Objetivo EMR
Portal del dueño de mascota: ver el historial de su animal, ver y confirmar citas, recibir notificaciones push.

### Tecnología

Expo 52, React Native, Expo Router (file-based routing), NativeWind (Tailwind para RN), `expo-secure-store` para tokens.

### Flujo de incorporación (onboarding)

El dueño de mascota no se registra directamente — la clínica le da un **código de invitación de 8 caracteres**.

```
Pantalla invite.tsx → usuario ingresa código XXXX-XXXX
 └── Llama a API: GET /v1/auth/invite/:code
 └── Si válido: muestra el nombre de la clínica
 └── Usuario continúa a login con credenciales
```

Esta pantalla (`apps/mobile/src/app/(auth)/invite.tsx`) tiene una UX de cajas individuales para cada carácter, con navegación automática y soporte de pegado de texto.

### Tokens seguros

**Archivo**: `apps/mobile/src/lib/auth.ts`

Los tokens JWT se guardan en `expo-secure-store` (Keychain en iOS, EncryptedSharedPreferences en Android). Nunca en AsyncStorage ni en memoria volátil.

Claves guardadas: `emr_access_token`, `emr_refresh_token`, `emr_tenant_id`, `emr_user_id`, `emr_push_token`.

### Notificaciones push

**Archivo**: `apps/mobile/src/lib/notifications.ts`

Tras el login, la app:
1. Pide permisos de notificación al sistema operativo.
2. Obtiene el Expo Push Token del proyecto EAS.
3. Lo registra en el API backend.
4. Configura canales de notificación en Android: `default`, `appointments` (alta prioridad), `vaccinations` (prioridad normal).

En el layout raíz (`apps/mobile/src/app/_layout.tsx`), los listeners de notificaciones enrutan al usuario a la pantalla correcta según el tipo de notificación (`appointment` → vista de cita, `vaccination` → perfil de mascota).

### Rutas de la app móvil

```
/index              ← Splash / redirección según auth state
/(auth)/login       ← Login con email + contraseña
/(auth)/register    ← Registro de nueva cuenta
/(auth)/invite      ← Pantalla de código de invitación
/(tabs)/index       ← Inicio (próximas citas, noticias)
/(tabs)/pets/       ← Lista de mis mascotas
/(tabs)/pets/[id]   ← Perfil + historial de la mascota
/(tabs)/appointments← Mis citas
/(tabs)/profile     ← Perfil del usuario
```

---

## 12. Paquetes compartidos

### `@emr/shared` — `packages/shared/`

Tipos TypeScript puros sin dependencias de runtime. Los mismos tipos son usados por el API, el frontend web y la app móvil:
- Enums: `UserRole`, `Species`, `Gender`, `AppointmentStatus`, `AppointmentType`
- Interfaces de dominio: `Pet`, `Owner`, `Appointment`, `MedicalRecord`, etc.

Esto garantiza que si se cambia un enum en un lugar, el compilador detecta el error en todos los demás.

### `@emr/tsconfig` — `packages/config/tsconfig/`

Configuraciones base de TypeScript:
- `base.json` — configuración común
- `nestjs.json` — extiende base con `emitDecoratorMetadata: true`, `experimentalDecorators: true`, `module: CommonJS` (requerido por NestJS)
- `nextjs.json` — extiende base con configuración para Next.js

### `@emr/tailwind-config` — `packages/config/tailwind/`

`tailwind.config.ts` compartido. Todos los colores apuntan a CSS custom properties (`hsl(var(--primary))`), lo que hace posible el sistema de temas en tiempo de ejecución.

---

## 13. Lo que falta

Lo construido es la base funcional completa del EMR. Lo que falta para un producto en producción:

### Funcionalidades pendientes

| Área | Qué falta |
|---|---|
| Autenticación | Implementar la lógica de `InviteCode` en el API (endpoint `POST /v1/auth/invite`) |
| Veterinarios | Módulo `VetsModule` para crear y gestionar perfiles de veterinarios |
| Archivos adjuntos | Endpoint en `MedicalRecordsModule` para subir y listar attachments usando `StorageService` |
| Estadísticas del dashboard | Endpoint real en el API para los datos del dashboard (`GET /v1/dashboard/stats`) |
| Historial clínico en móvil | Pantallas de historial y detalle de registro médico en la app |
| Facturación | No hay módulo de pagos ni facturación |
| Vacunas / calendario preventivo | No hay tracking de esquema de vacunación |
| Telemedicina | No implementado |
| Búsqueda global | No hay búsqueda por texto libre (los índices GIN en BD están listos para `pg_trgm`) |

### Configuración pendiente

- Crear archivo `.env` en `apps/api/` con las variables reales (ver `apps/api/src/config/*.ts` para los nombres exactos).
- Resolver conflicto del puerto 5432 si hay PostgreSQL local instalado.
- Correr las migraciones de Prisma: `cd packages/database && pnpm prisma migrate deploy`.
- Crear el bucket en MinIO para desarrollo.

---

*Generado el 2026-05-18. Refleja el estado actual del código en `main`.*
