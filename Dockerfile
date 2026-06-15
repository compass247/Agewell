# syntax=docker/dockerfile:1

# ---------- stage 1: build the Vite app ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Build. VITE_API_BASE is baked in at build time (Vite inlines import.meta.env).
# Empty default = same-origin /api; CI sets it to the API subdomain.
ARG VITE_API_BASE=""
ENV VITE_API_BASE=$VITE_API_BASE
COPY . .
RUN npm run build

# ---------- stage 2: serve static files with nginx ----------
FROM nginx:1.27-alpine AS runtime

# Drop the default config and add ours
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/agewell.conf

# Static site
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Basic healthcheck against the dedicated endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
