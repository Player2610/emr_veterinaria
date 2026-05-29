# ─── base ──────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN npm install -g pnpm@9

# ─── deps ──────────────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

# Copy manifests only — layer cache survives code changes
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY packages/shared/package.json      ./packages/shared/
COPY packages/database/package.json    ./packages/database/
COPY packages/ui/package.json          ./packages/ui/
COPY apps/api/package.json             ./apps/api/

RUN pnpm install --frozen-lockfile

# ─── builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules                  ./node_modules
COPY --from=deps /app/packages/shared/node_modules  ./packages/shared/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/apps/api/node_modules         ./apps/api/node_modules

# Copy source
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY turbo.json pnpm-workspace.yaml package.json ./

# Build @emr/shared then @emr/api
RUN pnpm --filter @emr/shared build 2>/dev/null || true
RUN pnpm --filter @emr/api build

# Generate Prisma client
RUN pnpm --filter @emr/database db:generate

# ─── runner ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Only copy what the runtime needs
COPY --from=builder /app/apps/api/dist                    ./dist
COPY --from=builder /app/node_modules                     ./node_modules
COPY --from=builder /app/packages/database/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/packages/database/prisma         ./prisma

EXPOSE 3001
CMD ["node", "dist/main"]
