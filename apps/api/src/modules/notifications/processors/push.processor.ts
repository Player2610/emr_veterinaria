import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PUSH_QUEUE, PushJobPayload } from '../notifications.service';

@Processor(PUSH_QUEUE)
export class PushProcessor {
  private readonly logger = new Logger(PushProcessor.name);

  @Process('send')
  async handleSend(job: Job<PushJobPayload>): Promise<void> {
    const { userId, title, body, data, tenantId } = job.data;

    this.logger.debug(
      `Processing push job ${job.id}: "${title}" -> user ${userId} [tenant: ${tenantId}]`,
    );

    try {
      // In production, replace with your push provider:
      //   - Firebase FCM: admin.messaging().send({ token: deviceToken, notification: { title, body } })
      //   - Expo Push Notifications
      //   - APNs / Web Push
      //
      // You would retrieve the device token from your UserDevice table first:
      //   const tokens = await prisma.userDevice.findMany({ where: { userId } });
      //   await fcm.sendMulticast({ tokens: tokens.map(t => t.fcmToken), notification: { title, body } });

      // Simulate sending
      await new Promise((resolve) => setTimeout(resolve, 50));

      this.logger.log(
        `Push notification sent to user ${userId} | title: "${title}"`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send push to user ${userId} (job ${job.id}): ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
