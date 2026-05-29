import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EMAIL_QUEUE, EmailJobPayload } from '../notifications.service';

@Processor(EMAIL_QUEUE)
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @Process('send')
  async handleSend(job: Job<EmailJobPayload>): Promise<void> {
    const { to, subject, templateId, variables, tenantId } = job.data;

    this.logger.debug(
      `Processing email job ${job.id}: ${templateId} -> ${to} [tenant: ${tenantId}]`,
    );

    try {
      // In production, replace this block with your email provider SDK call
      // e.g., SendGrid, Resend, AWS SES, etc.
      //
      // Example with Resend:
      //   await resend.emails.send({
      //     from: `noreply@${tenantSlug}.clinica.com`,
      //     to,
      //     subject,
      //     html: await renderTemplate(templateId, variables),
      //   });

      // Simulate sending
      await new Promise((resolve) => setTimeout(resolve, 100));

      this.logger.log(
        `Email sent to ${to} | template: ${templateId} | subject: "${subject}"`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to} (job ${job.id}): ${(error as Error).message}`,
      );
      throw error; // Let BullMQ handle retry
    }
  }
}
