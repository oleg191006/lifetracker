# ── Stage 1: Build ────────────────────────────────────────────────────────────
# Install all dependencies and compile TypeScript.
# We use the full workspace context because NestJS relies on packages hoisted
# to the root node_modules by npm workspaces.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests first — Docker caches this layer if they don't change,
# skipping a slow `npm ci` on every code change.
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies for the entire workspace
RUN npm ci

# Copy the rest of the source code
COPY tsconfig.base.json ./
COPY apps/api/ ./apps/api/
COPY packages/shared/ ./packages/shared/

# Compile TypeScript → JavaScript in apps/api/dist/
RUN npm run build --workspace=apps/api

# ── Stage 2: Production image ─────────────────────────────────────────────────
# Smaller final image — only runtime artefacts, no dev tools.
FROM node:20-alpine

WORKDIR /app

# Copy compiled output from builder
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
# Copy the hoisted node_modules (prod + dev deps — nest needs reflect-metadata etc.)
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

ENV NODE_ENV=production

# Start the compiled app
CMD ["node", "dist/main"]
