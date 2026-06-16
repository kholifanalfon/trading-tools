/**
 * Push/apply migrations to database.
 * Usage: bun run db:migrate or npm run db-migrate
 */
import { $ } from "bun";

console.log("🔄 Applying migrations to database...");
try {
  await $`cd apps/backend && bunx drizzle-kit push:pg`;
  console.log("✅ Migrations applied successfully.");
} catch (error) {
  console.error("❌ Failed to apply migrations:", error);
  process.exit(1);
}
