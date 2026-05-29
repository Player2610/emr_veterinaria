import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export const EMAIL_QUEUE = 'email';
export const PUSH_QUEUE = 'push';

export interface EmailJobPayload {
  to: string;
  subject: string;
  templateId: string;
  variables: Record<string, string | number>;
  tenantId: string;
}

export interface PushJobPayload {
  userId: string;
  tenantId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
    @InjectQueue(PUSH_QUEUE) private readonly pushQueue: Queue,
  ) {}

  async sendEmail(payload: EmailJobPayload): Promise<void> {
    await this.emailQueue.add('send', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
    this.logger.debug(`Email job queued for ${payload.to} [${payload.templateId}]`);
  }

  async sendPush(payload: PushJobPayload): Promise<void> {
    await this.pushQueue.add('send', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
    });
    this.logger.debug(`Push job queued for user ${payload.userId}`);
  }

  /**
   * Convenience: notify tenant admin when a new appointment is booked.
   */
  async notifyAppointmentBooked(opts: {
    adminEmail: string;
    petName: string;
    vetName: string;
    scheduledAt: Date;
    tenantId: string;
  }): Promise<void> {
    await this.sendEmail({
      to: opts.adminEmail,
      subject: `New appointment booked – ${opts.petName}`,
      templateId: 'appointment-booked',
      variables: {
        petName: opts.petName,
        vetName: opts.vetName,
        scheduledAt: opts.scheduledAt.toISOString(),
      },
      tenantId: opts.tenantId,
    });
  }

  /**
   * Convenience: remind pet owner of upcoming appointment.
   */
  async sendAppointmentReminder(opts: {
    ownerEmail: string;
    petName: string;
    scheduledAt: Date;
    tenantId: string;
  }): Promise<void> {
    await this.sendEmail({
      to: opts.ownerEmail,
      subject: `Reminder: Appointment for ${opts.petName} tomorrow`,
      templateId: 'appointment-reminder',
      variables: {
        petName: opts.petName,
        scheduledAt: opts.scheduledAt.toISOString(),
      },
      tenantId: opts.tenantId,
    });
  }
}
