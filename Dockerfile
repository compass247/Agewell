# syntax=docker/dockerfile:1

# ---------- stage 1: build the Next.js app ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# NEXT_PUBLIC_* are inlined at build time. CI sets these per deploy.
ARG NEXT_PUBLIC_API_BASE=""
ARG NEXT_PUBLIC_CMS_BASE=""
ARG NEXT_PUBLIC_SITE_URL="https://compassagewell.com"
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_CMS_BASE=$NEXT_PUBLIC_CMS_BASE
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

COPY . .
RUN npm run build

# ---------- stage 2: minimal standalone runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js "standalone" output: a self-contained server + traced deps.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000

# Healthcheck hits the app's /healthz route (app/healthz/route.js).
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/healthz || exit 1

CMD ["node", "server.js"]
