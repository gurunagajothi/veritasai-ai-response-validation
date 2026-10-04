# ===================================================
# Dockerfile: VeritasAI Quality Intelligence Platform
# Node.js 20 on Debian Slim with SQLite native compilation
# ===================================================

FROM node:20-slim AS builder

WORKDIR /app

# Install native build tools required for better-sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy full application source
COPY . .

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

# Install runtime tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Prepare application & persistent data directories
RUN mkdir -p /app/data && chown -R node:node /app

# Copy production artifacts
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=node:node /app/src ./src

USER node

EXPOSE 3000

CMD ["npm", "start"]
