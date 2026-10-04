# ===================================================
# Dockerfile: VeritasAI Quality Intelligence Platform
# Node.js 20 on Debian Slim with SQLite native compilation
# ===================================================

FROM node:20-slim AS builder

WORKDIR /app

# Configure APT to handle corporate proxies/Docker Desktop proxy safely
RUN echo "Acquire::http::Pipeline-Depth 0;\nAcquire::http::No-Cache true;\nAcquire::BrokenProxy true;" > /etc/apt/apt.conf.d/99fix-bad-proxy && \
    apt-get update && \
    apt-get install -y --no-install-recommends --fix-missing \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies (better-sqlite3@12.11.1 compiles/installs cleanly for Node 20)
COPY package*.json ./
RUN npm ci

# Copy full application source
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
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install runtime tools including curl for container health check
RUN echo "Acquire::http::Pipeline-Depth 0;\nAcquire::http::No-Cache true;\nAcquire::BrokenProxy true;" > /etc/apt/apt.conf.d/99fix-bad-proxy && \
    apt-get update && \
    apt-get install -y --no-install-recommends --fix-missing \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Prepare application & persistent data directories
RUN mkdir -p /app/data && chown -R node:node /app

# Declare persistent volume mount point for SQLite database and WAL files
VOLUME ["/app/data"]

# Copy production artifacts
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=node:node /app/src ./src

USER node

EXPOSE 3000

# Container health monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["npm", "start"]
