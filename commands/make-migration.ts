/**
 * Create a new custom migration generator.
 * Usage: bun run make:migration -- <migration-name>
 * Contoh: bun run make:migration -- create-users-table
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GENERATORS_DIR = resolve("apps/backend/src/db/generators");

const migrationName = process.argv[2];
if (!migrationName) {
  console.error("❌ Migration name is required.");
  console.error("   Usage: bun run make:migration -- <migration-name>");
  console.error("   Example: bun run make:migration -- create-users-table");
  process.exit(1);
}

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(migrationName)) {
  console.error(
    "❌ Migration name must be kebab-case (e.g., create-users-table)",
  );
  process.exit(1);
}

const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
const fileName = `${date}_${migrationName}.ts`;
const filePath = join(GENERATORS_DIR, fileName);

if (!existsSync(GENERATORS_DIR)) {
  mkdirSync(GENERATORS_DIR, { recursive: true });
}

const template = `/**
 * Migration Generator: ${migrationName}
 * Created on ${date}
 */

export async function up() {
  console.log("⬆️ Running migration up: ${migrationName}");
  // Implement up migration logic
}

export async function down() {
  console.log("⬇️ Running migration down: ${migrationName}");
  // Implement down migration logic
}
`;

writeFileSync(filePath, template, "utf-8");
console.log(
  `✅ Migration generator created: apps/backend/src/db/generators/${fileName}`,
);
