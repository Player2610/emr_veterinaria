import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { OwnersService } from './owners.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { UserRole } from '@emr/shared';

@ApiTags('Owners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('owners')
export class OwnersController {
  constructor(private readonly ownersService: OwnersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.VET, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'List all pet owners in the tenant' })
  findAll(@CurrentTenant() tenantId: string) {
    return this.ownersService.findAll(tenantId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.VET, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'Get owner by ID with their pets' })
  @ApiParam({ name: 'id', description: 'Owner UUID' })
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.ownersService.findOne(id, tenantId);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.VET, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'Register a new owner' })
  create(@Body() dto: CreateOwnerDto, @CurrentTenant() tenantId: string) {
    return this.ownersService.create(dto, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.VET, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'Update owner details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOwnerDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.ownersService.update(id, dto, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete owner' })
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.ownersService.remove(id, tenantId);
  }
}
