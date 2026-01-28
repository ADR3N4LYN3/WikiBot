FROM node:20-alpine AS base

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

# Generate Prisma client
RUN pnpm --filter @wikibot/database db:generate

# Build packages
RUN pnpm --filter @wikibot/shared build
RUN pnpm --filter @wikibot/api build

# Production stage
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy built files
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/api ./apps/api

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["node", "dist/index.js"]
