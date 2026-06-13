/**
 * Eksekusi semua seeder di apps/backend/src/db/seeders/ secara berurutan.
 * Usage: bun run db:seed or npm run db-seed
 */
import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const SEEDERS_DIR = resolve("apps/backend/src/db/seeders");

async function runSeeders() {
  console.log("🌱 Running database seeders...");
  console.log(`📂 Seeders directory: ${SEEDERS_DIR}\n`);

  try {
    const files = await readdir(SEEDERS_DIR);
    const seederFiles = files.filter((f) => f.endsWith(".seeder.ts")).sort(); // Urutan berdasarkan prefix angka (001, 002, dst.)

    if (seederFiles.length === 0) {
      console.log("⚠️  No seeder files found.");
      return;
    }

    for (const file of seederFiles) {
      console.log(`➡️  Running seeder: ${file}`);
      const filePath = join(SEEDERS_DIR, file);
      const seeder = await import(filePath);
      if (typeof seeder.default === "function") {
        await seeder.default();
      } else {
        console.warn(`⚠️  Seeder ${file} does not export a default function.`);
      }
    }

    console.log("\n🎉 All seeders executed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

runSeeders();
