/**
 * Seed de desarrollo — EMR Veterinaria
 *
 * Crea un tenant de demo con:
 *  - 1 TENANT_ADMIN
 *  - 2 VETs (con perfil Vet)
 *  - 3 Owners (1 vinculado a cuenta PET_OWNER)
 *  - 5 Pets repartidas entre los owners
 *  - 6 Appointments (mezcla de estados)
 *  - 2 MedicalRecords con diagnósticos y tratamientos
 *
 * Ejecutar: pnpm --filter @emr/database db:seed
 */

import { PrismaClient, UserRole, Species, Gender, AppointmentStatus, AppointmentType, TenantPlan } from '@prisma/client';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

// ─── Helpers ──────────────────────────────────────────────────

/** Suma `days` días a una fecha dada (o a ahora) */
function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Resta `years` años a ahora */
function yearsAgo(years: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

/** Fecha de hoy a las HH:MM en UTC */
function todayAt(hours: number, minutes = 0): Date {
  const d = new Date();
  d.setUTCHours(hours, minutes, 0, 0);
  return d;
}

// ─── Datos de seed ────────────────────────────────────────────

async function main() {
  console.log('🌱  Iniciando seed de desarrollo...\n');

  // ── Limpiar datos anteriores del tenant demo ──────────────
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.attachment.deleteMany(),
    prisma.medicalRecord.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.vet.deleteMany(),
    prisma.pet.deleteMany(),
    prisma.owner.deleteMany(),
    prisma.user.deleteMany({ where: { tenant: { slug: 'demo-clinica' } } }),
    prisma.tenant.deleteMany({ where: { slug: 'demo-clinica' } }),
  ]);
  console.log('  Datos anteriores del tenant "demo-clinica" eliminados.');

  // ── 1. Tenant ─────────────────────────────────────────────
  const tenant = await prisma.tenant.create({
    data: {
      slug: 'demo-clinica',
      name: 'Clínica Veterinaria Demo',
      plan: TenantPlan.PRO,
      isActive: true,
      settings: {
        timezone: 'America/Bogota',
        currency: 'COP',
        appointmentDuration: 30,
        reminderHours: 24,
        language: 'es',
      },
      theme: {
        primaryColor: '#2563EB',
        accentColor: '#16A34A',
        logoUrl: null,
        fontFamily: 'Inter',
      },
    },
  });
  console.log(`  Tenant creado: ${tenant.name} (${tenant.slug})`);

  // ── 2. Admin del tenant ───────────────────────────────────
  const adminUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@demo-clinica.com',
      // hash bcrypt de "demo1234!" (12 rounds) — solo para desarrollo
      passwordHash: '$2a$12$QrfZVPMjeq/YCvnGmMEnxeg7uVpK79qqloFwHBnvUvTU.rg/0.Uoa',
      firstName: 'Carlos',
      lastName: 'Administrador',
      phone: '+57 300 111 2233',
      role: UserRole.TENANT_ADMIN,
      isActive: true,
    },
  });
  console.log(`  Admin creado: ${adminUser.firstName} ${adminUser.lastName}`);

  // ── 3. Veterinarios ───────────────────────────────────────
  const vetUser1 = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'dra.garcia@demo-clinica.com',
      passwordHash: '$2a$12$QrfZVPMjeq/YCvnGmMEnxeg7uVpK79qqloFwHBnvUvTU.rg/0.Uoa',
      firstName: 'Laura',
      lastName: 'García',
      phone: '+57 310 222 3344',
      role: UserRole.VET,
      isActive: true,
      avatarUrl: 'https://i.pravatar.cc/150?u=laura.garcia',
    },
  });

  const vetUser2 = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'dr.mendez@demo-clinica.com',
      passwordHash: '$2a$12$QrfZVPMjeq/YCvnGmMEnxeg7uVpK79qqloFwHBnvUvTU.rg/0.Uoa',
      firstName: 'Andrés',
      lastName: 'Méndez',
      phone: '+57 315 333 4455',
      role: UserRole.VET,
      isActive: true,
      avatarUrl: 'https://i.pravatar.cc/150?u=andres.mendez',
    },
  });

  const vet1 = await prisma.vet.create({
    data: {
      tenantId: tenant.id,
      userId: vetUser1.id,
      licenseNumber: 'MVZ-12345-COL',
      specialities: ['Medicina interna', 'Dermatología'],
      bio: 'Veterinaria con 8 años de experiencia en medicina interna y dermatología canina y felina.',
      availableSlots: {
        monday:    { start: '08:00', end: '17:00', slotMinutes: 30 },
        tuesday:   { start: '08:00', end: '17:00', slotMinutes: 30 },
        wednesday: { start: '08:00', end: '17:00', slotMinutes: 30 },
        thursday:  { start: '08:00', end: '17:00', slotMinutes: 30 },
        friday:    { start: '08:00', end: '14:00', slotMinutes: 30 },
      },
    },
  });

  const vet2 = await prisma.vet.create({
    data: {
      tenantId: tenant.id,
      userId: vetUser2.id,
      licenseNumber: 'MVZ-67890-COL',
      specialities: ['Cirugía', 'Ortopedia', 'Traumatología'],
      bio: 'Cirujano veterinario especializado en cirugía de tejidos blandos y ortopedia de pequeños animales.',
      availableSlots: {
        monday:    { start: '09:00', end: '18:00', slotMinutes: 45 },
        wednesday: { start: '09:00', end: '18:00', slotMinutes: 45 },
        friday:    { start: '09:00', end: '16:00', slotMinutes: 45 },
      },
    },
  });
  console.log(`  Vets creados: ${vetUser1.firstName} y ${vetUser2.firstName}`);

  // ── 4. Dueños ─────────────────────────────────────────────
  // Owner 1: con cuenta de usuario (app móvil)
  const ownerUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'sofia.ramirez@email.com',
      passwordHash: '$2a$12$QrfZVPMjeq/YCvnGmMEnxeg7uVpK79qqloFwHBnvUvTU.rg/0.Uoa',
      firstName: 'Sofía',
      lastName: 'Ramírez',
      phone: '+57 320 444 5566',
      role: UserRole.PET_OWNER,
      isActive: true,
    },
  });

  const owner1 = await prisma.owner.create({
    data: {
      tenantId: tenant.id,
      userId: ownerUser.id,
      firstName: 'Sofía',
      lastName: 'Ramírez',
      email: 'sofia.ramirez@email.com',
      phone: '+57 320 444 5566',
      address: 'Calle 45 # 12-30, Bogotá, Colombia',
      notes: 'Prefiere recordatorios por WhatsApp.',
    },
  });

  // Owner 2: sin cuenta de usuario
  const owner2 = await prisma.owner.create({
    data: {
      tenantId: tenant.id,
      firstName: 'Miguel',
      lastName: 'Torres',
      email: 'miguel.torres@empresa.com',
      phone: '+57 312 555 6677',
      address: 'Av. El Dorado # 68C-61, Bogotá, Colombia',
    },
  });

  // Owner 3: sin cuenta de usuario
  const owner3 = await prisma.owner.create({
    data: {
      tenantId: tenant.id,
      firstName: 'Ana María',
      lastName: 'López',
      email: 'anamaria.lopez@gmail.com',
      phone: '+57 316 666 7788',
      address: 'Carrera 7 # 32-16, Bogotá, Colombia',
      notes: 'Adulta mayor, hablar despacio y con claridad.',
    },
  });
  console.log(`  Owners creados: ${owner1.firstName}, ${owner2.firstName}, ${owner3.firstName}`);

  // ── 5. Mascotas ───────────────────────────────────────────
  const pet1 = await prisma.pet.create({
    data: {
      tenantId: tenant.id,
      ownerId: owner1.id,
      name: 'Luna',
      species: Species.DOG,
      breed: 'Labrador Retriever',
      color: 'Dorado',
      gender: Gender.FEMALE,
      birthDate: yearsAgo(3),
      weight: 28.5,
      microchipId: '941000024680135',
      photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
      notes: 'Alérgica al pollo. Asegurarse de revisar ingredientes en tratamientos.',
    },
  });

  const pet2 = await prisma.pet.create({
    data: {
      tenantId: tenant.id,
      ownerId: owner1.id,
      name: 'Mochi',
      species: Species.CAT,
      breed: 'Persa',
      color: 'Blanco y gris',
      gender: Gender.MALE,
      birthDate: yearsAgo(5),
      weight: 4.2,
      microchipId: '941000024680246',
      photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
      notes: 'Problemas renales crónicos. Dieta especial con agua extra.',
    },
  });

  const pet3 = await prisma.pet.create({
    data: {
      tenantId: tenant.id,
      ownerId: owner2.id,
      name: 'Rocky',
      species: Species.DOG,
      breed: 'Bulldog Francés',
      color: 'Atigrado',
      gender: Gender.MALE,
      birthDate: yearsAgo(2),
      weight: 12.8,
      notes: 'Problemas respiratorios típicos de la raza. Evitar ejercicio intenso en calor.',
    },
  });

  const pet4 = await prisma.pet.create({
    data: {
      tenantId: tenant.id,
      ownerId: owner2.id,
      name: 'Nala',
      species: Species.CAT,
      breed: 'Siamés',
      color: 'Seal point',
      gender: Gender.FEMALE,
      birthDate: yearsAgo(1),
      weight: 3.1,
    },
  });

  const pet5 = await prisma.pet.create({
    data: {
      tenantId: tenant.id,
      ownerId: owner3.id,
      name: 'Thor',
      species: Species.DOG,
      breed: 'Golden Retriever',
      color: 'Dorado claro',
      gender: Gender.MALE,
      birthDate: yearsAgo(7),
      weight: 34.2,
      microchipId: '941000024680357',
      photoUrl: 'https://images.unsplash.com/photo-1559190394-df5a28aab5c5?w=400',
      notes: 'Displasia de cadera bilateral. Tratamiento mensual con condroprotectores.',
    },
  });
  console.log(`  Pets creadas: ${[pet1, pet2, pet3, pet4, pet5].map(p => p.name).join(', ')}`);

  // ── 6. Citas ──────────────────────────────────────────────
  const now = new Date();

  // Cita completada (ayer)
  const appt1 = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      petId: pet1.id,
      vetId: vet1.id,
      ownerId: owner1.id,
      title: 'Consulta general — Luna',
      notes: 'Revisión post-vacuna y control de peso.',
      status: AppointmentStatus.COMPLETED,
      type: AppointmentType.GENERAL_CHECKUP,
      startTime: addDays(todayAt(10), -1),
      endTime:   addDays(todayAt(10, 30), -1),
    },
  });

  // Cita confirmada (hoy)
  const appt2 = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      petId: pet3.id,
      vetId: vet1.id,
      ownerId: owner2.id,
      title: 'Vacunación anual — Rocky',
      status: AppointmentStatus.CONFIRMED,
      type: AppointmentType.VACCINATION,
      startTime: todayAt(14),
      endTime:   todayAt(14, 30),
    },
  });

  // Cita programada (mañana)
  const appt3 = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      petId: pet5.id,
      vetId: vet2.id,
      ownerId: owner3.id,
      title: 'Control displasia + condroprotector — Thor',
      notes: 'Traer radiografías anteriores.',
      status: AppointmentStatus.PENDING_CONFIRMATION,
      type: AppointmentType.FOLLOW_UP,
      startTime: addDays(todayAt(9), 1),
      endTime:   addDays(todayAt(9, 45), 1),
    },
  });

  // Cirugía programada (en 3 días)
  const appt4 = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      petId: pet2.id,
      vetId: vet2.id,
      ownerId: owner1.id,
      title: 'Limpieza dental — Mochi',
      notes: 'Ayuno de 12h previo. Anestesia general.',
      status: AppointmentStatus.PENDING_CONFIRMATION,
      type: AppointmentType.SURGERY,
      startTime: addDays(todayAt(10), 3),
      endTime:   addDays(todayAt(11, 30), 3),
    },
  });

  // Cita cancelada (hace 3 días)
  const appt5 = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      petId: pet4.id,
      vetId: vet1.id,
      ownerId: owner2.id,
      title: 'Esterilización — Nala',
      notes: 'Cancelada por el propietario. Reprogramar.',
      status: AppointmentStatus.CANCELLED,
      type: AppointmentType.SURGERY,
      startTime: addDays(todayAt(8), -3),
      endTime:   addDays(todayAt(9), -3),
    },
  });

  // Emergencia (ayer, completada)
  const appt6 = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      petId: pet1.id,
      vetId: vet1.id,
      ownerId: owner1.id,
      title: 'EMERGENCIA — Luna, vómito y letargia',
      notes: 'Ingresó sin cita. Posible intoxicación.',
      status: AppointmentStatus.COMPLETED,
      type: AppointmentType.EMERGENCY,
      startTime: addDays(todayAt(18), -1),
      endTime:   addDays(todayAt(19), -1),
    },
  });
  console.log(`  Citas creadas: ${[appt1, appt2, appt3, appt4, appt5, appt6].length} appointments`);

  // ── 7. Historias clínicas ─────────────────────────────────
  const record1 = await prisma.medicalRecord.create({
    data: {
      tenantId: tenant.id,
      petId: pet1.id,
      vetId: vet1.id,
      appointmentId: appt1.id,
      chiefComplaint: 'Control post-vacuna. Dueña reporta buena energía.',
      anamnesis: 'Luna recibió vacuna polivalente hace 10 días. Sin reacciones adversas reportadas. Come y bebe con normalidad. Heces y orina normales.',
      physicalExam: {
        weight: 28.5,
        temperature: 38.6,
        heartRate: 90,
        respiratoryRate: 22,
        mucousMembranes: 'Rosa, húmedas, TLLC <2s',
        lymphNodes: 'Sin adenomegalias',
        abdomen: 'Blando, sin dolor a la palpación',
        integument: 'Pelaje brillante, sin lesiones cutáneas activas',
        locomotor: 'Sin cojeras, marcha normal',
        bodyConditionScore: 4,
      },
      diagnoses: [
        {
          code: 'Z00.0',
          description: 'Examen de rutina — paciente sano',
          isPrimary: true,
        },
      ],
      treatments: [
        {
          name: 'Antiparasitario externo',
          product: 'Bravecto® 500mg',
          dose: '1 comprimido',
          frequency: 'Cada 3 meses',
          duration: '3 meses',
          route: 'Oral',
        },
      ],
      prescriptions: [],
      notes: 'Paciente en excelentes condiciones. Próximo control en 6 meses. Recordar refuerzo de rabia en 2 meses.',
      followUpDate: addDays(now, 60),
    },
  });

  const record2 = await prisma.medicalRecord.create({
    data: {
      tenantId: tenant.id,
      petId: pet1.id,
      vetId: vet1.id,
      appointmentId: appt6.id,
      chiefComplaint: 'Vómito × 4 episodios, letargia, inapetencia de 6 horas de evolución.',
      anamnesis: 'Dueña refiere que Luna estuvo en el jardín esta tarde y posiblemente ingirió algo desconocido. Comenzó con vómito bilioso hace 6h. Último alimento hace 8h.',
      physicalExam: {
        weight: 28.2,
        temperature: 39.1,
        heartRate: 110,
        respiratoryRate: 26,
        mucousMembranes: 'Pálidas, levemente secas, TLLC 2.5s',
        hydration: 'Deshidratación 5-7%',
        abdomen: 'Distendido, sensible a la palpación en hipogastrio',
        lymphNodes: 'Sin adenomegalias',
        locomotor: 'Paciente postrada, levantamiento con ayuda',
        bodyConditionScore: 4,
      },
      diagnoses: [
        {
          code: 'T65.9',
          description: 'Intoxicación por sustancia desconocida — probable ingesta de planta tóxica',
          isPrimary: true,
        },
        {
          code: 'K92.1',
          description: 'Gastroenteritis aguda secundaria',
          isPrimary: false,
        },
      ],
      treatments: [
        {
          name: 'Fluidoterapia IV',
          product: 'Solución Ringer Lactato',
          dose: '500 mL',
          frequency: 'Continuo × 4h (125 mL/h)',
          duration: '4 horas',
          route: 'Intravenosa',
        },
        {
          name: 'Antieméico',
          product: 'Metoclopramida',
          dose: '0.3 mg/kg = 8.5 mg',
          frequency: 'Cada 8 horas × 3 días',
          duration: '3 días',
          route: 'IV → IM',
        },
        {
          name: 'Protector gástrico',
          product: 'Omeprazol',
          dose: '1 mg/kg = 28 mg',
          frequency: 'Cada 24 horas × 5 días',
          duration: '5 días',
          route: 'IV → Oral',
        },
      ],
      prescriptions: [
        {
          drug: 'Omeprazol 20mg',
          dose: '1.5 comprimidos',
          instructions: 'En ayunas, 30 min antes del desayuno. Dar por 5 días.',
          durationDays: 5,
        },
        {
          drug: 'Metoclopramida 10mg',
          dose: '1 comprimido',
          instructions: 'Con comida, cada 8 horas. Solo si persiste el vómito en casa.',
          durationDays: 3,
        },
      ],
      notes: 'Paciente se estabilizó tras 4h de fluidoterapia. Alta con dieta blanda (arroz + pollo sin condimentos) por 3 días. Revisión en 48h o antes si recae. Dueña informada sobre plantas tóxicas comunes en jardines.',
      followUpDate: addDays(now, 2),
    },
  });
  console.log(`  Historias clínicas creadas: ${record1.id.slice(-6)}, ${record2.id.slice(-6)}`);

  // ── 8. AuditLogs de ejemplo ───────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      {
        tenantId: tenant.id,
        userId: vetUser1.id,
        action: 'CREATE_MEDICAL_RECORD',
        resource: 'medical_records',
        resourceId: record1.id,
        meta: { ip: '192.168.1.10', userAgent: 'Mozilla/5.0 (seed)' },
      },
      {
        tenantId: tenant.id,
        userId: vetUser1.id,
        action: 'CREATE_MEDICAL_RECORD',
        resource: 'medical_records',
        resourceId: record2.id,
        meta: { ip: '192.168.1.10', userAgent: 'Mozilla/5.0 (seed)' },
      },
      {
        tenantId: tenant.id,
        userId: vetUser1.id,
        action: 'READ_MEDICAL_RECORD',
        resource: 'medical_records',
        resourceId: record1.id,
        meta: { ip: '192.168.1.10', userAgent: 'Mozilla/5.0 (seed)' },
      },
    ],
  });

  // ── Resumen ───────────────────────────────────────────────
  console.log('\n✅  Seed completado exitosamente.\n');
  console.log('  Resumen:');
  console.log(`    Tenant:       ${tenant.name} (slug: ${tenant.slug})`);
  console.log(`    Usuarios:     5 (1 admin, 2 vets, 1 pet_owner, + ownerUser)`);
  console.log(`    Owners:       3`);
  console.log(`    Mascotas:     5`);
  console.log(`    Citas:        6`);
  console.log(`    HC:           2`);
  console.log(`    Audit logs:   3`);
  console.log('\n  Credenciales de acceso (solo desarrollo):');
  console.log('    Admin:   admin@demo-clinica.com       / demo1234!');
  console.log('    Vet 1:   dra.garcia@demo-clinica.com  / demo1234!');
  console.log('    Vet 2:   dr.mendez@demo-clinica.com   / demo1234!');
  console.log('    Dueño:   sofia.ramirez@email.com      / demo1234!\n');
}

main()
  .catch((e) => {
    console.error('❌  Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
