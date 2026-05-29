import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'clinica-peludo', description: 'URL-safe slug, unique across tenants' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(63)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers and hyphens',
  })
  slug!: string;

  @ApiProperty({ example: 'Clínica Veterinaria Peludo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'admin@clinica-peludo.com' })
  @IsEmail()
  adminEmail!: string;

  @ApiPropertyOptional({ example: 'https://clinica-peludo.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'America/Bogota' })
  @IsOptional()
  @IsString()
  timezone?: string;
}
