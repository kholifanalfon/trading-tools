/**
 * Generate Drizzle migration from schema changes.
 * Usage: bun run db:generate or npm run db-generate
 */
import { $ } from "bun";

console.log("🔄 Generating migration from schema changes...");
try {
  await $`cd apps/backend && bunx drizzle-kit generate:pg`;
  console.log("✅ Migration generated successfully.");
} catch (error) {
  console.error("❌ Failed to generate migration:", error);
  process.exit(1);
}
