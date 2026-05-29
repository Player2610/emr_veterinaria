import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserRole } from '@emr/shared';

export class CreateUserDto {
  @ApiProperty({ example: 'vet@clinica.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  firstName!: string;

  @ApiProperty({ example: 'García' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  lastName!: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.VET })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiPropertyOptional({ example: '+57 310 000 0000' })
  @IsOptional()
  @IsString()
  phone?: string;
}
