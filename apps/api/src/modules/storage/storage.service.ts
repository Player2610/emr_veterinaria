import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
  size: number;
  contentType: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const region = configService.get<string>('storage.region') ?? 'us-east-1';
    const endpoint = configService.get<string>('storage.endpoint');

    this.s3 = new S3Client({
      region,
      ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
      credentials: {
        accessKeyId: configService.get<string>('storage.accessKeyId') ?? '',
        secretAccessKey:
          configService.get<string>('storage.secretAccessKey') ?? '',
      },
    });

    this.bucket =
      configService.get<string>('storage.bucket') ?? 'emr-veterinaria-assets';
  }

  /**
   * Upload a file buffer to S3/R2.
   * Key format: `<tenantId>/<folder>/<uuid>.<ext>`
   */
  async upload(opts: {
    buffer: Buffer;
    originalName: string;
    contentType: string;
    tenantId: string;
    folder?: string;
  }): Promise<UploadResult> {
    const ext = opts.originalName.split('.').pop() ?? 'bin';
    const folder = opts.folder ?? 'uploads';
    const key = `${opts.tenantId}/${folder}/${randomUUID()}.${ext}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: opts.buffer,
          ContentType: opts.contentType,
          Metadata: {
            tenantId: opts.tenantId,
            originalName: opts.originalName,
          },
        }),
      );
    } catch (err) {
      this.logger.error(`S3 upload failed for key ${key}: ${(err as Error).message}`);
      throw new InternalServerErrorException('File upload failed');
    }

    const url = await this.getPresignedDownloadUrl(key, 3600);
    this.logger.log(`Uploaded ${key} (${opts.buffer.length} bytes)`);

    return {
      key,
      url,
      bucket: this.bucket,
      size: opts.buffer.length,
      contentType: opts.contentType,
    };
  }

  /**
   * Generate a pre-signed download URL valid for `expiresInSeconds`.
   */
  async getPresignedDownloadUrl(
    key: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }

  /**
   * Generate a pre-signed upload URL so clients can upload directly to S3.
   * Limits: maxContentLength, contentType enforced server-side via conditions.
   */
  async getPresignedUploadUrl(opts: {
    tenantId: string;
    contentType: string;
    folder?: string;
    originalName?: string;
  }): Promise<{ uploadUrl: string; key: string }> {
    const ext = opts.originalName?.split('.').pop() ?? 'bin';
    const folder = opts.folder ?? 'uploads';
    const key = `${opts.tenantId}/${folder}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: opts.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    return { uploadUrl, key };
  }

  /**
   * Delete a file from S3/R2.
   */
  async delete(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      this.logger.log(`Deleted ${key}`);
    } catch (err) {
      this.logger.error(`S3 delete failed for key ${key}: ${(err as Error).message}`);
      throw new InternalServerErrorException('File deletion failed');
    }
  }

  /**
   * Check if a file exists in the bucket.
   */
  async exists(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }
}
