#!/bin/bash
set -e

# Works whether called from repo root or from apps/api
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

npm install -g pnpm@9
pnpm install --frozen-lockfile
pnpm --filter @emr/database db:generate
pnpm --filter @emr/api build
