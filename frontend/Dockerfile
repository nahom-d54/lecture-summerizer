# Frontend Dockerfile
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate

WORKDIR /app

# Copy workspace root files needed for pnpm
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy frontend package files
COPY frontend/package.json ./frontend/
COPY frontend/tsconfig*.json ./frontend/
COPY frontend/vite.config.ts ./frontend/
COPY frontend/tailwind.config.js ./frontend/
COPY frontend/postcss.config.js ./frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy frontend source code
COPY frontend/index.html ./frontend/
COPY frontend/public ./frontend/public
COPY frontend/src ./frontend/src

# Build application
WORKDIR /app/frontend
RUN pnpm run build

# Production stage with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
