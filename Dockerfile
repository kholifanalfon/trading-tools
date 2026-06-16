FROM oven/bun:1-alpine

WORKDIR /app

# Copy root monorepo files
COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/docs/package.json ./apps/docs/

# Install dependencies
RUN bun install

# Copy application source
COPY apps/backend ./apps/backend
COPY commands ./commands

# Copy entrypoint script
COPY docker/backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["bun", "run", "--cwd", "apps/backend", "start"]
