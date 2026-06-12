# Build stage
FROM oven/bun:1-alpine AS build

WORKDIR /app

COPY package.json ./
COPY apps/docs/package.json ./apps/docs/

RUN bun install

COPY apps/docs ./apps/docs

RUN bun run --cwd apps/docs build

# Nginx stage
FROM nginx:alpine
COPY --from=build /app/apps/docs/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
