# ── Stage 1: Build the React app ─────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace root files needed for npm workspaces
COPY ../../package.json ../../package-lock.json ../../
COPY ../../packages/shared ./packages/shared
COPY . .

RUN npm ci
RUN npm run build

# ── Stage 2: Serve with nginx ────────────────────────────────────
# nginx is a lightweight web server, perfect for serving static files
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
