import { Module } from '@nestjs/common';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [PetsController],
  providers: [PetsService, PrismaService],
  exports: [PetsService],
})
export class PetsModule {}
