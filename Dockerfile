# =============================================================================
# STAGE 1 — builder
# Installs all deps (dev + prod) and compiles the SvelteKit app.
# =============================================================================
FROM node:20-alpine AS builder

LABEL org.opencontainers.image.title="Barbershop Handler"
LABEL org.opencontainers.image.description="SvelteKit barbershop management app"

WORKDIR /app

# Copy manifests first to exploit Docker layer cache:
# node_modules are only re-installed when package*.json changes.
COPY package*.json ./
RUN npm install

# Copy source and compile
COPY . .
RUN npm run build

# Strip dev dependencies to reduce what gets copied to the runner stage
RUN npm prune --omit=dev

# =============================================================================
# STAGE 2 — runner
# Minimal image with only the compiled output and production node_modules.
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Create a non-root user to run the process (principle of least privilege)
RUN addgroup -g 1001 -S nodejs \
 && adduser  -u 1001 -S sveltekit -G nodejs

# Runtime environment — secrets/URIs are injected at deploy time via env vars
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy only what's needed from the builder stage
COPY --from=builder --chown=sveltekit:nodejs /app/build       ./build
COPY --from=builder --chown=sveltekit:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=sveltekit:nodejs /app/package.json ./package.json

USER sveltekit

EXPOSE 3000

# Liveness check: wget is available in alpine and adds no extra layer
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ > /dev/null || exit 1

CMD ["node", "build"]
