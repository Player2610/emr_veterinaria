import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@emr/shared';

export const ROLES_KEY = 'roles';

/**
 * @Roles(...roles) – declares which UserRole values are allowed to access
 * the decorated route. Evaluated by RolesGuard.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
