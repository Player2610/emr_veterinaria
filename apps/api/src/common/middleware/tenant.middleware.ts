import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * TenantMiddleware – resolves the tenant from:
 *  1. Subdomain: `<tenant>.api.example.com`
 *  2. `x-tenant-id` header (fallback / local dev)
 *
 * The resolved slug/id is stored in `req.tenantId` for downstream guards and
 * services.  Note: this middleware only does a best-effort extraction; the
 * definitive tenant validation happens in TenantGuard.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(
    req: Request & { tenantId?: string },
    _res: Response,
    next: NextFunction,
  ): void {
    // --- 1. Extract from subdomain ---------------------------------------
    const host = req.hostname ?? '';
    // host format: "<tenant>.api.example.com" or "api.example.com" (no tenant)
    const parts = host.split('.');
    if (parts.length >= 3) {
      // First segment is the tenant slug
      const candidate = parts[0];
      if (candidate && candidate !== 'api' && candidate !== 'www') {
        req.tenantId = candidate;
        return next();
      }
    }

    // --- 2. Fallback to header -------------------------------------------
    const headerTenant = req.headers['x-tenant-id'];
    if (typeof headerTenant === 'string' && headerTenant.length > 0) {
      req.tenantId = headerTenant;
    }

    next();
  }
}
