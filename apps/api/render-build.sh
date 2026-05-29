#!/bin/bash
set -e

# Go to monorepo root
cd ../..

npm install -g pnpm@9
pnpm install --frozen-lockfile
pnpm --filter @emr/database db:generate
pnpm --filter @emr/api build
