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
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { UserRole } from '@emr/shared';

@ApiTags('Pets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.VET, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'List all pets in the tenant' })
  findAll(@CurrentTenant() tenantId: string) {
    return this.petsService.findAll(tenantId);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.VET,
    UserRole.ASSISTANT,
    UserRole.PET_OWNER,
  )
  @ApiOperation({ summary: 'Get pet details with recent records and upcoming appointments' })
  @ApiParam({ name: 'id', description: 'Pet UUID' })
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.petsService.findOne(id, tenantId);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.VET, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'Register a new pet' })
  create(@Body() dto: CreatePetDto, @CurrentTenant() tenantId: string) {
    return this.petsService.create(dto, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.VET, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'Update pet information' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePetDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.petsService.update(id, dto, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete pet and all associated records' })
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.petsService.remove(id, tenantId);
  }
}
