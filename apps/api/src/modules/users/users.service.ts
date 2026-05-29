import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@emr/shared';

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  phone: true,
  avatarUrl: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.user.findMany({
      where: { tenantId },
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async create(dto: CreateUserDto, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);

    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email, tenantId },
    });
    if (existing) throw new ConflictException('Email already registered in this tenant');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        role: dto.role,
        phone: dto.phone,
        tenantId,
      },
      select: USER_SELECT,
    });
  }

  async update(id: string, dto: UpdateUserDto, tenantId: string) {
    await this.findOne(id, tenantId);

    const data: Record<string, unknown> = { ...dto };
    delete data['newPassword'];

    if (dto.newPassword) {
      data['passwordHash'] = await bcrypt.hash(dto.newPassword, 12);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
  }

  async remove(id: string, tenantId: string, requestingUserRole: string) {
    const user = await this.findOne(id, tenantId);
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot delete SUPER_ADMIN users');
    }
    await this.prisma.user.delete({ where: { id } });
    return { deleted: id };
  }
}
