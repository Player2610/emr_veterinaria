import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsService, EMAIL_QUEUE, PUSH_QUEUE } from './notifications.service';
import { EmailProcessor } from './processors/email.processor';
import { PushProcessor } from './processors/push.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host') ?? 'localhost',
          port: configService.get<number>('redis.port') ?? 6379,
          password: configService.get<string>('redis.password'),
          ...(configService.get<boolean>('redis.tls') ? { tls: {} } : {}),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: EMAIL_QUEUE },
      { name: PUSH_QUEUE },
    ),
  ],
  providers: [NotificationsService, EmailProcessor, PushProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
