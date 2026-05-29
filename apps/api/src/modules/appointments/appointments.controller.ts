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
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { UserRole } from '@emr/shared';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.VET,
    UserRole.ASSISTANT,
  )
  @ApiOperation({ summary: 'List appointments in the tenant' })
  findAll(@CurrentTenant() tenantId: string) {
    return this.appointmentsService.findAll(tenantId);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.VET,
    UserRole.ASSISTANT,
    UserRole.PET_OWNER,
  )
  @ApiOperation({ summary: 'Get appointment details' })
  @ApiParam({ name: 'id', description: 'Appointment UUID' })
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.appointmentsService.findOne(id, tenantId);
  }

  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.VET,
    UserRole.ASSISTANT,
  )
  @ApiOperation({ summary: 'Schedule a new appointment' })
  create(@Body() dto: CreateAppointmentDto, @CurrentTenant() tenantId: string) {
    return this.appointmentsService.create(dto, tenantId);
  }

  @Patch(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.VET,
    UserRole.ASSISTANT,
  )
  @ApiOperation({ summary: 'Update appointment (reschedule, change status, etc.)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.appointmentsService.update(id, dto, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.VET,
    UserRole.ASSISTANT,
  )
  @ApiOperation({ summary: 'Cancel an appointment' })
  cancel(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.appointmentsService.cancel(id, tenantId);
  }
}
