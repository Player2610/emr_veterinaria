import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
  IsObject,
} from 'class-validator';

export class CreateMedicalRecordDto {
  @ApiProperty({ description: 'Pet UUID' })
  @IsUUID()
  petId!: string;

  @ApiPropertyOptional({ description: 'Appointment UUID (si está vinculado)' })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiProperty({ example: 'Letargo y pérdida de apetito desde hace 3 días' })
  @IsString()
  @IsNotEmpty()
  chiefComplaint!: string;

  @ApiPropertyOptional({ example: 'El paciente presenta decaimiento general...' })
  @IsOptional()
  @IsString()
  anamnesis?: string;

  @ApiPropertyOptional({
    description: 'Examen físico — { weight, temperature, heartRate, respiratoryRate, ... }',
    example: { weight: 28.5, temperature: 38.5, heartRate: 80 },
  })
  @IsOptional()
  @IsObject()
  physicalExam?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: '[{ code, description, isPrimary }]',
    example: [{ code: 'K29', description: 'Gastritis', isPrimary: true }],
  })
  @IsOptional()
  @IsArray()
  diagnoses?: unknown[];

  @ApiPropertyOptional({
    description: '[{ name, dose, frequency, duration, route }]',
    example: [{ name: 'Metronidazol', dose: '250mg', frequency: 'BID', duration: '7 días' }],
  })
  @IsOptional()
  @IsArray()
  treatments?: unknown[];

  @ApiPropertyOptional({
    description: '[{ drug, dose, instructions, durationDays }]',
  })
  @IsOptional()
  @IsArray()
  prescriptions?: unknown[];

  @ApiPropertyOptional({ example: 'Observar hidratación. Consultar si no mejora en 48h.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '2025-07-01', description: 'Fecha de seguimiento' })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;
}
