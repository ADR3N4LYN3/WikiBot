FROM node:20-alpine AS base

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy package.json files for all workspaces
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/tsconfig/package.json ./packages/config/tsconfig/
COPY packages/config/eslint-config/package.json ./packages/config/eslint-config/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared
COPY packages/config ./packages/config
COPY apps/api ./apps/api

# Build packages (database includes prisma generate)
RUN pnpm --filter @wikibot/database build
RUN pnpm --filter @wikibot/shared build
RUN pnpm --filter @wikibot/api build

# Production stage
FROM node:20-alpine AS production

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy built files
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/api ./apps/api

WORKDIR /app/apps/api

# Create entrypoint script that syncs DB schema before starting
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'echo "🔄 Syncing database schema..."' >> /entrypoint.sh && \
    echo 'cd /app/packages/database && npx prisma db push --skip-generate 2>&1 || echo "⚠️ DB sync failed (might be ok if no changes)"' >> /entrypoint.sh && \
    echo 'echo "✅ Starting API server..."' >> /entrypoint.sh && \
    echo 'cd /app/apps/api && exec node dist/index.js' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

EXPOSE 4000

CMD ["/entrypoint.sh"]
