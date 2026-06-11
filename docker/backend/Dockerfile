FROM oven/bun:1-alpine

WORKDIR /app

# Copy root monorepo files
COPY package.json ./
COPY apps/backend/package.json ./apps/backend/

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
CMD ["bun", "--cwd", "apps/backend", "start"]
