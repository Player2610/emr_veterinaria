#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

npm install -g pnpm@9

# Install ALL deps (including devDeps: prisma, nest, tsc)
NODE_ENV=development pnpm install --frozen-lockfile

# 1. Build @emr/shared first — API imports from ./dist/, not ./src/
pnpm --filter @emr/shared build

# 2. Generate Prisma client
pnpm --filter @emr/database db:generate

# 3. Build NestJS API
pnpm --filter @emr/api build
