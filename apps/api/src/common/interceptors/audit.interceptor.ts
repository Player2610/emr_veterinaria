import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuthenticatedUser } from '../decorators/user.decorator';

/**
 * AuditInterceptor – logs access to sensitive resources.
 *
 * Apply to individual controllers/routes with @UseInterceptors(AuditInterceptor)
 * or register globally in AppModule for full audit coverage.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser; tenantId?: string }>();

    const { method, url, ip } = request;
    const user = request.user;
    const tenantId = request.tenantId ?? user?.tenantId ?? 'unknown';
    const userId = user?.sub ?? 'anonymous';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          this.logger.log(
            `[${tenantId}] ${userId} ${method} ${url} +${ms}ms`,
          );
        },
        error: (err: Error) => {
          const ms = Date.now() - start;
          this.logger.warn(
            `[${tenantId}] ${userId} ${method} ${url} ERROR ${err.message} +${ms}ms`,
          );
        },
      }),
    );
  }
}
