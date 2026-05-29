import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../decorators/user.decorator';

/**
 * TenantGuard – ensures a tenantId is present on the request.
 *
 * Resolution order:
 *  1. JWT payload `tenantId` (set by JwtStrategy after authentication)
 *  2. `x-tenant-id` header  (useful for SUPER_ADMIN acting on behalf of a tenant)
 *  3. Subdomain extracted by TenantMiddleware
 *
 * The resolved tenantId is written to `req.tenantId` so that @CurrentTenant()
 * can pick it up and services can use it for RLS context.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<
      Request & { user?: AuthenticatedUser; tenantId?: string }
    >();

    // Priority 1 – JWT payload (already populated by JwtAuthGuard)
    if (request.user?.tenantId) {
      request.tenantId = request.user.tenantId;
      return true;
    }

    // Priority 2 – explicit header (SUPER_ADMIN cross-tenant operations)
    const headerTenant = request.headers['x-tenant-id'];
    if (typeof headerTenant === 'string' && headerTenant.length > 0) {
      request.tenantId = headerTenant;
      return true;
    }

    // Priority 3 – subdomain set by TenantMiddleware
    if (request.tenantId && request.tenantId.length > 0) {
      return true;
    }

    throw new BadRequestException(
      'Unable to resolve tenant. Provide a valid JWT or x-tenant-id header.',
    );
  }
}
