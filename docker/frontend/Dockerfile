# Build stage
FROM oven/bun:1-alpine AS build

WORKDIR /app

# Copy package descriptors
COPY package.json bun.lock ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/
COPY apps/docs/package.json ./apps/docs/

# Install dependencies
RUN bun install

# Copy application files
COPY apps/frontend ./apps/frontend

# Set environment variables for build
ARG FE_VITE_API_URL
ENV FE_VITE_API_URL=$FE_VITE_API_URL
ARG FE_VITE_SENTRY_DSN
ENV FE_VITE_SENTRY_DSN=$FE_VITE_SENTRY_DSN

# Build static assets
RUN bun run --cwd apps/frontend build

# Nginx host stage
FROM nginx:alpine
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
