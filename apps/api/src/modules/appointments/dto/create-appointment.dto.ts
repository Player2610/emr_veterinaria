import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { AppointmentStatus, AppointmentType } from '@emr/shared';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Pet UUID' })
  @IsUUID()
  petId!: string;

  @ApiProperty({ description: 'Owner UUID' })
  @IsUUID()
  ownerId!: string;

  @ApiPropertyOptional({ description: 'Veterinarian user UUID' })
  @IsOptional()
  @IsUUID()
  vetId?: string;

  @ApiProperty({ example: 'Consulta anual + vacunas' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: '2025-06-15T10:00:00.000Z', description: 'ISO 8601 datetime' })
  @IsDateString()
  startTime!: string;

  @ApiProperty({ example: '2025-06-15T10:30:00.000Z', description: 'ISO 8601 datetime' })
  @IsDateString()
  endTime!: string;

  @ApiPropertyOptional({ enum: AppointmentType, example: AppointmentType.GENERAL_CHECKUP })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @ApiPropertyOptional({ enum: AppointmentStatus, example: AppointmentStatus.PENDING_CONFIRMATION })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ example: 'Ayuno 4 horas antes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
