import { registerAs } from '@nestjs/config';

export const storageConfig = registerAs('storage', () => ({
  provider: process.env.STORAGE_PROVIDER ?? 's3',
  bucket: process.env.STORAGE_BUCKET ?? 'emr-veterinaria-assets',
  region: process.env.STORAGE_REGION ?? 'us-east-1',
  endpoint: process.env.STORAGE_ENDPOINT ?? undefined,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
}));
