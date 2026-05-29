import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') ?? 3000;
  const corsOrigins = configService.get<string[]>('app.corsOrigins') ?? [];
  const apiPrefix = configService.get<string>('app.apiPrefix') ?? 'v1';
  const nodeEnv = configService.get<string>('app.nodeEnv') ?? 'development';

  // ── Security headers ──────────────────────────────────────────────────────
  app.use(
    helmet({
      // Allow Swagger UI to load in development
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
    }),
  );

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
    credentials: true,
  });

  // ── Global prefix ─────────────────────────────────────────────────────────
  app.setGlobalPrefix(apiPrefix, {
    // Exclude health-check endpoint from prefix
    exclude: ['/health'],
  });

  // ── Global pipes ─────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,          // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Global filters ────────────────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Global interceptors ───────────────────────────────────────────────────
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new ResponseInterceptor(),
    new AuditInterceptor(),
  );

  // ── Swagger ───────────────────────────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('EMR Veterinaria API')
      .setDescription(
        'Multi-tenant Electronic Medical Record system for veterinary clinics',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT',
      )
      .addApiKey(
        { type: 'apiKey', name: 'x-tenant-id', in: 'header' },
        'x-tenant-id',
      )
      .addTag('Auth', 'Authentication & session management')
      .addTag('Tenants', 'Tenant management (SUPER_ADMIN only)')
      .addTag('Users', 'User management within a tenant')
      .addTag('Owners', 'Pet owner / client management')
      .addTag('Pets', 'Pet registration and profiles')
      .addTag('Appointments', 'Appointment scheduling')
      .addTag('Medical Records', 'Clinical consultation records')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    logger.log(`Swagger UI available at http://localhost:${port}/docs`);
  }

  // ── Start ─────────────────────────────────────────────────────────────────
  await app.listen(port);
  logger.log(`API running on http://localhost:${port}/${apiPrefix}`);
}

bootstrap().catch((err: Error) => {
  new Logger('Bootstrap').error('Fatal startup error', err.stack);
  process.exit(1);
});
