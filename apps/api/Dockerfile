# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN npm ci

COPY tsconfig.base.json ./
COPY apps/api/ ./apps/api/
COPY packages/shared/ ./packages/shared/

RUN npm run build --workspace=apps/api

# ── Stage 2: Production ───────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json

EXPOSE 3000
ENV NODE_ENV=production

CMD ["sh", "-c", "node ./node_modules/typeorm/cli.js migration:run -d dist/database/data-source.js && node dist/main"]
