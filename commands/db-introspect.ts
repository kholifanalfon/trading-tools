/**
 * Introspect existing database and generate schema Drizzle.
 * Usage: bun run db:introspect or npm run db-introspect
 */
import { $ } from "bun";

console.log("🔍 Introspecting database...");
try {
  await $`cd apps/backend && bunx drizzle-kit introspect`;
  console.log("✅ Introspection completed.");
} catch (error) {
  console.error("❌ Failed to introspect database:", error);
  process.exit(1);
}
