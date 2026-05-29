import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UserRole } from '@emr/shared';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenant.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        plan: true,
        isActive: true,
        createdAt: true,
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { _count: { select: { users: true, pets: true } } },
    });
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);
    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException(`Tenant "${slug}" not found`);
    return tenant;
  }

  async create(dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Tenant slug "${dto.slug}" already taken`);
    }

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          slug: dto.slug,
          name: dto.name,
          settings: {},
          theme: {},
        },
      });

      const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      await tx.user.create({
        data: {
          email: dto.adminEmail,
          firstName: 'Admin',
          lastName: dto.name,
          passwordHash,
          role: UserRole.TENANT_ADMIN,
          tenantId: tenant.id,
        },
      });

      this.logger.log(
        `Tenant ${tenant.slug} created; admin ${dto.adminEmail} provisioned`,
      );
      return { tenant, tempPassword };
    });
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);
    return this.prisma.tenant.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
