import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNumber,
  Min,
  MaxLength,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Species, Gender } from '@emr/shared';

export class CreatePetDto {
  @ApiProperty({ example: 'Max' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @ApiProperty({ enum: Species, example: Species.DOG })
  @IsEnum(Species)
  species!: Species;

  @ApiPropertyOptional({ example: 'Golden Retriever' })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiPropertyOptional({ example: 'Dorado' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender!: Gender;

  @ApiPropertyOptional({ example: '2020-05-15', description: 'Fecha de nacimiento (ISO date)' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 28.5, description: 'Peso en kg' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: '985112345678901' })
  @IsOptional()
  @IsString()
  microchipId?: string;

  @ApiPropertyOptional({ example: 'Alérgico a la penicilina' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDeceased?: boolean;

  @ApiProperty({ description: 'Owner UUID' })
  @IsUUID()
  ownerId!: string;
}
