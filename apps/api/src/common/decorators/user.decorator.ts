import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface AuthenticatedUser {
  sub: string;
  tenantId: string;
  role: string;
  email: string;
}

/**
 * @CurrentUser() – extracts the authenticated user payload injected by
 * JwtAuthGuard (via passport-jwt strategy).
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    return request.user as AuthenticatedUser;
  },
);
