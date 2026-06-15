import { db } from "@/db/db";
import { scoringRules } from "@/db/schema";
import { sql } from "drizzle-orm";
import seedScoringRules from "@/db/seeders/003-scoring-rules.seeder";
import { logger } from "./logger";

export async function initializeDatabase() {
  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(scoringRules);
    const count = result[0]?.count || 0;

    if (Number(count) === 0) {
      logger.info("🌱 Scoring rules table is empty. Running auto-seeding...");
      await seedScoringRules();
    } else {
      logger.info(`✅ Scoring rules database verified (${count} rules found).`);
    }
  } catch (err) {
    logger.error("❌ Failed to verify/seed database scoring rules on startup:", err);
  }
}
