# Propuesta: SaaS Veterinario + App Móvil

## Contexto del producto

- **SaaS web (clínicas/veterinarios):** gestión de pacientes, historias clínicas, citas, facturación, inventario, staff.
- **App móvil (dueños):** ficha de su mascota, recordatorios (vacunas, desparasitación), citas, mensajería con la clínica, historial.
- **Cross-cutting:** multi-tenant (cada clínica = un tenant aislado), datos médicos sensibles, escala progresiva.

---

## Propuestas de stack (3 opciones)

### Opción A — Pragmática / time-to-market (recomendada para arrancar)
- **Backend:** NestJS (Node + TypeScript) o **FastAPI** (Python). API REST + algunos endpoints WebSocket para chat/notificaciones.
- **Base de datos:** PostgreSQL (con **Row-Level Security** para multi-tenancy) + Redis (caché, colas).
- **Web SaaS:** Next.js (React) + TailwindCSS + shadcn/ui.
- **App móvil:** **React Native (Expo)** — un solo código para iOS/Android, reuso de tipos con el backend TS.
- **Auth:** Auth0 / Clerk / Supabase Auth (delegar; ahorra meses de trabajo).
- **Storage:** S3 (AWS) o R2 (Cloudflare) para imágenes/radiografías/PDFs.
- **Infra:** Railway/Render/Fly.io al inicio → AWS (ECS Fargate + RDS) cuando escale.
- **Observabilidad:** Sentry + Logtail/Better Stack + UptimeRobot.

**Por qué:** un solo lenguaje (TS) de punta a punta, ecosistema enorme, despliegue barato, fácil contratar.

### Opción B — Robusta / empresarial
- **Backend:** Spring Boot (Java/Kotlin) o **.NET 8** (C#).
- **DB:** PostgreSQL + Redis + ElasticSearch (búsquedas).
- **Web:** Angular o Next.js.
- **Móvil:** **Flutter** (mejor rendimiento UI que RN).
- **Infra:** AWS/Azure con Kubernetes desde el día 1.

**Por qué:** mejor si planeas vender a cadenas grandes o tienes equipo con experiencia en estos stacks. **Contra:** más lento para iterar al inicio.

### Opción C — Hyper-managed / equipo pequeño
- **Backend + DB + Auth + Storage:** **Supabase** (Postgres + Auth + Storage + Edge Functions + Realtime).
- **Web:** Next.js en Vercel.
- **Móvil:** Expo + React Native.

**Por qué:** mínima infra que mantener, MVP en semanas. **Contra:** vendor lock-in y costos crecen rápido.

---

## Arquitectura propuesta (alto nivel, Opción A)

```
┌─────────────┐   ┌─────────────┐
│  Web SaaS   │   │  App Móvil  │
│  (Next.js)  │   │ (RN/Expo)   │
└──────┬──────┘   └──────┬──────┘
       │                  │
       └────────┬─────────┘
                │ HTTPS / JWT
       ┌────────▼────────┐
       │   API Gateway   │  (rate limit, CORS, WAF)
       └────────┬────────┘
                │
       ┌────────▼────────┐
       │   API (NestJS)  │  ──► Workers (BullMQ)
       │  Multi-tenant   │      • Notificaciones
       └────────┬────────┘      • Emails/SMS
                │                • Reportes
   ┌────────────┼────────────┐
   ▼            ▼            ▼
PostgreSQL   Redis         S3
(RLS por    (caché/      (imágenes,
 tenant)    sesiones/     PDFs)
            colas)
```

**Decisiones clave:**
- **Multi-tenancy:** un solo schema con `tenant_id` en cada tabla + **Row-Level Security** en Postgres. (Más simple que schema-por-tenant; suficiente hasta miles de clínicas.)
- **Modular monolith** primero, microservicios solo cuando duela. No empieces con microservicios.
- **API versionada** (`/v1/...`) desde el día 1 — la app móvil tarda en actualizar.
- **Event bus interno** (Redis Streams / BullMQ) para desacoplar notificaciones, recordatorios, reportes.

---

## Seguridad (no negociable para datos médicos)

1. **Auth:** OAuth2/OIDC, refresh tokens rotatorios, MFA para staff de clínica.
2. **Autorización:** RBAC (Owner, Vet, Asistente, Dueño) + RLS en DB como segunda barrera.
3. **Cifrado:** TLS 1.3 en tránsito, AES-256 en reposo, columnas sensibles cifradas a nivel app (pgcrypto).
4. **Auditoría:** tabla `audit_log` inmutable de quién vio/modificó qué historia clínica.
5. **Backups:** automáticos diarios + PITR (point-in-time recovery), probar restauración mensualmente.
6. **Secretos:** AWS Secrets Manager / Doppler — nunca en `.env` commiteados.
7. **Cumplimiento:** depende del país (Argentina: Ley 25.326; UE: GDPR; USA: no HIPAA salvo humanos). Definí jurisdicciones objetivo temprano.
8. **Pentest** antes de lanzar a producción con clientes pagos.

---

## Roadmap propuesto (~6-9 meses al MVP)

### Fase 0 — Descubrimiento (2-3 semanas)
- Entrevistar 5-10 veterinarios reales. Validar dolor #1.
- Definir pricing y segmento (clínicas chicas vs cadenas).
- Decidir stack final + jurisdicción legal.
- Diseñar wireframes (Figma) del flujo crítico.

### Fase 1 — Fundaciones (4-6 semanas)
- Setup repo (monorepo con Turborepo: `apps/web`, `apps/mobile`, `apps/api`, `packages/shared`).
- CI/CD (GitHub Actions), entornos `dev`/`staging`/`prod`.
- Auth + multi-tenancy + RBAC + RLS funcionando end-to-end.
- Modelo de datos núcleo: `Tenant`, `User`, `Pet`, `Owner`, `Vet`, `Appointment`, `MedicalRecord`.

### Fase 2 — MVP SaaS web (8-10 semanas)
- CRUD de mascotas + historias clínicas + adjuntos.
- Agenda de citas (calendario).
- Listado de clientes (dueños).
- Dashboard básico.
- **Hito:** 2-3 clínicas piloto usándolo gratis.

### Fase 3 — MVP App móvil (4-6 semanas, en paralelo al final de Fase 2)
- Onboarding del dueño con código de invitación de la clínica.
- Ver ficha + historial de su mascota.
- Recordatorios push (vacunas, próximas citas).
- Solicitar turno.

### Fase 4 — Monetización (3-4 semanas)
- Integración con pasarela de pago (Stripe / MercadoPago).
- Planes (Free / Pro / Clinic).
- Facturación recurrente.
- **Hito:** primer cliente pagando.

### Fase 5 — Escala y diferenciación (continuo)
- Inventario y farmacia.
- Mensajería clínica ↔ dueño.
- Telemedicina (videollamada).
- Reportes y analítica.
- IA: triaje básico de síntomas, OCR de recetas, sugerencias de diagnóstico.
- Integraciones (laboratorios, e-commerce de alimentos).

---

## Recomendación corta

Arrancar con **Opción A (NestJS + Next.js + Expo + Postgres con RLS en Railway)**. Modular monolith, multi-tenant desde el día 1, sin microservicios. Validar con 3 clínicas piloto antes de invertir en features avanzadas.
