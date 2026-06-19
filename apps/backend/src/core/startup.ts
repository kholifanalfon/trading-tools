import { db } from "@/db/db";
import { scoringRules } from "@/db/schema";
import { sql } from "drizzle-orm";
import seedScoringRules from "@/db/seeders/003-scoring-rules.seeder";
import { logger } from "./logger";

export async function initializeDatabase() {
  try {
    logger.info("🌱 Running database scoring rules verification & seeding...");
    await seedScoringRules();
    logger.info("✅ Database scoring rules verified & seeded successfully.");
  } catch (err) {
    logger.error("❌ Failed to verify/seed database scoring rules on startup:", err);
  }
}
