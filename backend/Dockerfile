# Backend Dockerfile
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate

WORKDIR /app

# Copy workspace root files needed for pnpm
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy backend package files
COPY backend/package.json ./backend/

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy backend source code
COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src

# Build TypeScript
WORKDIR /app/backend
RUN pnpm run build

# Production stage
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate

WORKDIR /app

# Copy workspace root files needed for pnpm
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy backend package files
COPY backend/package.json ./backend/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Copy built files from builder
COPY --from=builder /app/backend/dist ./backend/dist

# Create logs directory
WORKDIR /app/backend
RUN mkdir -p logs

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]
