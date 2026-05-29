import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

const OWNER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
} as const;

@Injectable()
export class PetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.pet.findMany({
      where: { tenantId },
      include: { owner: { select: OWNER_SELECT } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const pet = await this.prisma.pet.findFirst({
      where: { id, tenantId },
      include: {
        owner: true,
        medicalRecords: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        appointments: {
          where: { startTime: { gte: new Date() } },
          orderBy: { startTime: 'asc' },
          take: 3,
        },
      },
    });
    if (!pet) throw new NotFoundException(`Pet ${id} not found`);
    return pet;
  }

  async create(dto: CreatePetDto, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.pet.create({
      data: {
        name: dto.name,
        species: dto.species,
        breed: dto.breed,
        color: dto.color,
        gender: dto.gender,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        weight: dto.weight,
        microchipId: dto.microchipId,
        notes: dto.notes,
        ownerId: dto.ownerId,
        tenantId,
      },
      include: { owner: { select: OWNER_SELECT } },
    });
  }

  async update(id: string, dto: UpdatePetDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.pet.update({
      where: { id },
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.pet.delete({ where: { id } });
    return { deleted: id };
  }
}
