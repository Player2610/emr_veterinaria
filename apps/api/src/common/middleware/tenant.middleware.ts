import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * TenantMiddleware – resolves the tenant from:
 *  1. `x-tenant-id` header (explicit, highest priority)
 *  2. Subdomain: `<tenant>.api.example.com` (custom domain setup only)
 *
 * Header takes priority because cloud providers (Render, Railway, Fly) use
 * multi-part hostnames (e.g. emr-api.onrender.com) that would be misread as
 * tenant subdomains by the parts.length >= 3 check.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(
    req: Request & { tenantId?: string },
    _res: Response,
    next: NextFunction,
  ): void {
    // --- 1. Explicit header (highest priority) ----------------------------
    const headerTenant = req.headers['x-tenant-id'];
    if (typeof headerTenant === 'string' && headerTenant.length > 0) {
      req.tenantId = headerTenant;
      return next();
    }

    // --- 2. Subdomain (custom domain only: <tenant>.api.yourdomain.com) ---
    const host = req.hostname ?? '';
    const parts = host.split('.');
    // Require at least 4 parts to avoid matching cloud provider hostnames
    // like app-name.onrender.com (3 parts) as tenant subdomains.
    if (parts.length >= 4) {
      const candidate = parts[0];
      if (candidate && candidate !== 'api' && candidate !== 'www') {
        req.tenantId = candidate;
      }
    }

    next();
  }
}
