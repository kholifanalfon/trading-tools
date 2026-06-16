#!/bin/sh
set -e

echo "🔄 Running DB Migrations..."
bun run db:migrate || echo "⚠️ Migration failed or already applied"
bun run db:seed || echo "Seeder failed or already applied"

echo "🚀 Starting backend server..."
exec "$@"
