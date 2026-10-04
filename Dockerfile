# ===================================================
# Dockerfile: VeritasAI Quality Intelligence Platform
# Node.js 20 on Debian Slim with SQLite native compilation
# ===================================================

FROM node:20-slim AS builder

WORKDIR /app

# Install native build tools required for better-sqlite3 compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies (better-sqlite3@12.11.1 compiles cleanly for Node 20)
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .
RUN mkdir -p /app/public

# Run test suite during container build to verify zero regressions
RUN npm test

# Build production Next.js bundle
RUN npm run build

# ===================================================
# Runner Stage
# ===================================================
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Install runtime dependencies for SQLite
RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Prepare persistent data directory with non-root user permissions
RUN mkdir -p /app/data && chown -R node:node /app/data

# Copy production artifacts from builder
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=node:node /app/src ./src

USER node

EXPOSE 3000

CMD ["npm", "start"]
