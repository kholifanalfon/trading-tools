/**
 * Create a new seeder.
 * Usage: bun run make:seeder -- <seeder-name>
 * Contoh: bun run make:seeder -- users
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync, openSync, closeSync } from "node:fs";
import { join, resolve } from "node:path";

const SEEDERS_DIR = resolve("apps/backend/src/db/seeders");

const seederName = process.argv[2];
if (!seederName) {
  console.error("❌ Seeder name is required.");
  console.error("   Usage: bun run make:seeder -- <seeder-name>");
  console.error("   Example: bun run make:seeder -- users");
  process.exit(1);
}

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(seederName)) {
  console.error(
    "❌ Seeder name must be kebab-case (e.g., users, default-roles)",
  );
  process.exit(1);
}

if (!existsSync(SEEDERS_DIR)) {
  mkdirSync(SEEDERS_DIR, { recursive: true });
}

// Auto-increment prefix berdasarkan file seeder yang sudah ada
const existingFiles = readdirSync(SEEDERS_DIR).filter((f) =>
  f.endsWith(".seeder.ts"),
);
const nextPrefix = String(existingFiles.length + 1).padStart(3, "0");
const fileName = `${nextPrefix}-${seederName}.seeder.ts`;
const filePath = join(SEEDERS_DIR, fileName);

const template = `/**
 * Seeder: ${seederName}
 * Execution Order: ${nextPrefix}
 */

export default async function seed() {
  console.log("🌱 Seeding data for: ${seederName}...");
  // Implement seeding logic here
}
`;

let fd: number | null = null;
try {
  fd = openSync(filePath, "w");
  writeFileSync(fd, template, "utf-8");
} catch (error) {
  console.error(`❌ Failed to create seeder file: ${(error as Error).message}`);
  process.exit(1);
} finally {
  if (fd !== null) {
    closeSync(fd);
  }
}
console.log(`✅ Seeder created: apps/backend/src/db/seeders/${fileName}`);
