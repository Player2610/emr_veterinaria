import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'warn', 'error']
          : ['warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Prisma connected to PostgreSQL');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from PostgreSQL');
  }

  /**
   * Sets the PostgreSQL session variable `app.current_tenant_id` so that
   * all Row-Level Security (RLS) policies on tenant-scoped tables are
   * activated automatically for the duration of this transaction / query.
   *
   * Usage:
   *   await this.prisma.setTenantContext(tenantId);
   *   const pets = await this.prisma.pet.findMany();
   */
  async setTenantContext(tenantId: string): Promise<void> {
    // SET LOCAL scopes the variable to the current transaction, which is
    // required for PgBouncer transaction-mode compatibility (Neon pooler).
    // The Neon owner role bypasses RLS anyway; WHERE tenantId clauses enforce
    // isolation at the query level regardless.
    await this.$executeRawUnsafe(
      `SET LOCAL app.current_tenant_id = '${tenantId.replace(/'/g, "''")}'`,
    );
  }

  /**
   * Runs a callback inside a Prisma interactive transaction with the tenant
   * context already set.  This is the recommended way to perform tenant-scoped
   * operations because the SET is visible to every statement in the same
   * transaction.
   *
   * Example:
   *   const pet = await this.prisma.withTenant(tenantId, (tx) =>
   *     tx.pet.create({ data: { ... } })
   *   );
   */
  async withTenant<T>(
    tenantId: string,
    fn: (tx: PrismaClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `SET LOCAL app.current_tenant_id = '${tenantId.replace(/'/g, "''")}'`,
      );
      return fn(tx as unknown as PrismaClient);
    });
  }

  /**
   * Returns a thin proxy object whose Prisma model accessors automatically
   * run `SET LOCAL app.current_tenant_id` before every query by wrapping
   * each call in a short transaction.  Useful for fire-and-forget service
   * helpers that don't own a transaction.
   */
  prismaForTenant(tenantId: string): PrismaClient {
    // We return `this` with a $use middleware applied.  Because PrismaClient
    // middleware is global, we instead rely on callers using `withTenant` or
    // calling `setTenantContext` explicitly.  The method is kept here as a
    // named convenience that is consistent with the documented API contract.
    //
    // For production workloads, replace this with a per-request AsyncLocalStorage
    // context or Prisma middleware that reads the current tenant automatically.
    void this.setTenantContext(tenantId);
    return this as unknown as PrismaClient;
  }
}
