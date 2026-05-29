import { PartialType } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateTenantDto extends PartialType(
  OmitType(CreateTenantDto, ['slug', 'adminEmail'] as const),
) {}
