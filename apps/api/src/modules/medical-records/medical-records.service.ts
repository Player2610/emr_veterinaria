import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

const VET_SELECT = {
  id: true,
  userId: true,
  user: { select: { firstName: true, lastName: true } },
} as const;

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, petId?: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.medicalRecord.findMany({
      where: { tenantId, ...(petId ? { petId } : {}) },
      include: {
        pet: { select: { id: true, name: true, species: true } },
        vet: { select: VET_SELECT },
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const record = await this.prisma.medicalRecord.findFirst({
      where: { id, tenantId },
      include: {
        pet: { include: { owner: true } },
        vet: { select: VET_SELECT },
        appointment: true,
        attachments: true,
      },
    });
    if (!record) throw new NotFoundException(`Medical record ${id} not found`);
    return record;
  }

  async create(dto: CreateMedicalRecordDto, tenantId: string, vetId: string) {
    await this.prisma.setTenantContext(tenantId);

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `SET LOCAL app.current_tenant_id = '${tenantId.replace(/'/g, "''")}'`,
      );

      const record = await tx.medicalRecord.create({
        data: {
          petId: dto.petId,
          vetId,
          appointmentId: dto.appointmentId,
          chiefComplaint: dto.chiefComplaint,
          anamnesis: dto.anamnesis,
          physicalExam: (dto.physicalExam as Prisma.InputJsonValue) ?? Prisma.JsonNull,
          diagnoses: (dto.diagnoses as Prisma.InputJsonValue[]) ?? [],
          treatments: (dto.treatments as Prisma.InputJsonValue[]) ?? [],
          prescriptions: (dto.prescriptions as Prisma.InputJsonValue[]) ?? [],
          notes: dto.notes,
          followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
          tenantId,
        },
        include: {
          pet: { select: { id: true, name: true } },
          vet: { select: VET_SELECT },
        },
      });

      // Update pet weight if included in physicalExam
      if (dto.physicalExam && typeof dto.physicalExam === 'object' && 'weight' in (dto.physicalExam as object)) {
        const physExam = dto.physicalExam as Record<string, unknown>;
        if (physExam.weight !== undefined) {
          await tx.pet.update({
            where: { id: dto.petId },
            data: { weight: Number(physExam.weight) },
          });
        }
      }

      return record;
    });
  }

  async update(
    id: string,
    dto: UpdateMedicalRecordDto,
    tenantId: string,
    requestingVetId: string,
  ) {
    const record = await this.findOne(id, tenantId);

    if (record.vetId !== requestingVetId) {
      throw new ForbiddenException(
        'Only the authoring veterinarian can edit this record',
      );
    }

    const { followUpDate, diagnoses, treatments, prescriptions, physicalExam, ...rest } = dto;
    return this.prisma.medicalRecord.update({
      where: { id },
      data: {
        ...rest,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        physicalExam: physicalExam ? (physicalExam as Prisma.InputJsonValue) : undefined,
        diagnoses: diagnoses ? (diagnoses as Prisma.InputJsonValue[]) : undefined,
        treatments: treatments ? (treatments as Prisma.InputJsonValue[]) : undefined,
        prescriptions: prescriptions ? (prescriptions as Prisma.InputJsonValue[]) : undefined,
      },
    });
  }
}
