import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/user.decorator';
import { UserRole } from '@emr/shared';

@ApiTags('Medical Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
  ) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.VET, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'List medical records. Optionally filter by petId.' })
  @ApiQuery({ name: 'petId', required: false, description: 'Filter by pet UUID' })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('petId') petId?: string,
  ) {
    return this.medicalRecordsService.findAll(tenantId, petId);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.VET,
    UserRole.ASSISTANT,
    UserRole.PET_OWNER,
  )
  @ApiOperation({ summary: 'Get medical record details' })
  @ApiParam({ name: 'id', description: 'Medical record UUID' })
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.medicalRecordsService.findOne(id, tenantId);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.VET)
  @ApiOperation({ summary: 'Create a medical record for a pet visit' })
  create(
    @Body() dto: CreateMedicalRecordDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.medicalRecordsService.create(dto, tenantId, user.sub);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.VET)
  @ApiOperation({ summary: 'Update a medical record (authoring vet only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicalRecordDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.medicalRecordsService.update(id, dto, tenantId, user.sub);
  }
}
