#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

npm install -g pnpm@9

# Install ALL deps (including devDeps needed for build: prisma, nest, tsc)
# NODE_ENV=production causes pnpm to skip devDeps, so we override it here
NODE_ENV=development pnpm install --frozen-lockfile

pnpm --filter @emr/database db:generate
pnpm --filter @emr/api build
