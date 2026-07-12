# ============================================================
# Multi-stage Dockerfile for the NestJS backend
# Stage 1 builds the app, stage 2 ships only what's needed to run it
# ============================================================

# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cached layer, only reinstalled if package*.json changes)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---------- Stage 2: production runtime ----------
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# Only install production dependencies (smaller image, no dev tools)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output from the builder stage
COPY --from=builder /app/dist ./dist

# Run as a non-root user for security (clinic data = extra care)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["node", "dist/main.js"]
