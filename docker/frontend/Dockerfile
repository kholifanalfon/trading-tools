# Build stage
FROM oven/bun:1-alpine AS build

WORKDIR /app

# Copy package descriptors
COPY package.json ./
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN bun install

# Copy application files
COPY apps/frontend ./apps/frontend

# Build static assets
RUN bun --cwd apps/frontend run build

# Nginx host stage
FROM nginx:alpine
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
