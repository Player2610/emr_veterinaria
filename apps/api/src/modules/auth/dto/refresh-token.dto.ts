import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Opaque refresh token obtained from /auth/login' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
