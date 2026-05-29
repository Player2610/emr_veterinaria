import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppointmentStatus } from '@emr/shared';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

const VET_SELECT = {
  id: true,
  userId: true,
  licenseNumber: true,
  specialities: true,
  user: { select: { firstName: true, lastName: true, email: true } },
} as const;

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.appointment.findMany({
      where: { tenantId },
      include: {
        pet: { select: { id: true, name: true, species: true, breed: true } },
        vet: { select: VET_SELECT },
        owner: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, tenantId },
      include: {
        pet: { include: { owner: true } },
        vet: { select: VET_SELECT },
        medicalRecord: true,
      },
    });
    if (!appointment) throw new NotFoundException(`Appointment ${id} not found`);
    return appointment;
  }

  async create(dto: CreateAppointmentDto, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (startTime < new Date()) {
      throw new BadRequestException('Cannot schedule appointments in the past');
    }
    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    if (dto.vetId) {
      const conflict = await this.prisma.appointment.findFirst({
        where: {
          tenantId,
          vetId: dto.vetId,
          status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
          OR: [
            { startTime: { gte: startTime, lt: endTime } },
            { endTime: { gt: startTime, lte: endTime } },
            { startTime: { lte: startTime }, endTime: { gte: endTime } },
          ],
        },
      });
      if (conflict) {
        throw new BadRequestException('Vet has a conflicting appointment at this time');
      }
    }

    return this.prisma.appointment.create({
      data: {
        petId: dto.petId,
        vetId: dto.vetId,
        ownerId: dto.ownerId,
        title: dto.title,
        notes: dto.notes,
        type: dto.type,
        startTime,
        endTime,
        status: dto.status ?? AppointmentStatus.PENDING_CONFIRMATION,
        tenantId,
      },
      include: {
        pet: { select: { id: true, name: true } },
        vet: { select: VET_SELECT },
      },
    });
  }

  async update(id: string, dto: UpdateAppointmentDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...dto,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      },
    });
  }

  async cancel(id: string, tenantId: string) {
    const appointment = await this.findOne(id, tenantId);
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed appointment');
    }
    return this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED },
    });
  }
}
