import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * @CurrentTenant() – extracts the resolved tenantId from the request object.
 * The value is set by TenantMiddleware / TenantGuard earlier in the pipeline.
 */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request & { tenantId?: string }>();
    return request.tenantId ?? '';
  },
);
