import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Injectable()
export class OwnersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.owner.findMany({
      where: { tenantId },
      include: { _count: { select: { pets: true } } },
      orderBy: { firstName: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const owner = await this.prisma.owner.findFirst({
      where: { id, tenantId },
      include: {
        pets: { select: { id: true, name: true, species: true, breed: true } },
      },
    });
    if (!owner) throw new NotFoundException(`Owner ${id} not found`);
    return owner;
  }

  async create(dto: CreateOwnerDto, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.owner.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        notes: dto.notes,
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateOwnerDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.owner.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.owner.delete({ where: { id } });
    return { deleted: id };
  }
}
