/**
 * Reset database by dropping all tables and recreating them.
 * Usage: bun run db:reset
 */
import { $ } from "bun";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config({ path: resolve(__dirname, "../../../../.env") });

const databaseUrl = process.env.BE_DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ BE_DATABASE_URL is not defined in .env file.");
  process.exit(1);
}

console.log("🔄 Resetting database: Dropping all tables...");
try {
  const sql = postgres(databaseUrl);
  // Drop and recreate public schema to wipe everything
  await sql`DROP SCHEMA public CASCADE;`;
  await sql`CREATE SCHEMA public;`;
  await sql`GRANT ALL ON SCHEMA public TO public;`;
  await sql.end();
  console.log("✅ All tables dropped successfully.");

  console.log("🔄 Recreating tables via migration push...");
  await $`cd apps/backend && bunx drizzle-kit push:pg`;
  console.log("✅ Database schema created successfully.");
} catch (error) {
  console.error("❌ Failed to reset database:", error);
  process.exit(1);
}
