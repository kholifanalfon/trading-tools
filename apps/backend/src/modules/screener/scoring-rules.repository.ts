import { eq, and } from "drizzle-orm";
import { db } from "@/db/db";
import { scoringRules } from "@/db/schema";

export class ScoringRulesRepository {
  async getAllRules() {
    return db.select().from(scoringRules);
  }

  async getRulesByStrategy(strategy: string) {
    return db.select().from(scoringRules).where(eq(scoringRules.strategy, strategy));
  }

  async getRuleByParameter(strategy: string, parameterName: string) {
    const result = await db
      .select()
      .from(scoringRules)
      .where(and(eq(scoringRules.strategy, strategy), eq(scoringRules.parameterName, parameterName)))
      .limit(1);
    return result[0] || null;
  }

  async updateRule(id: number, value: number, weight: number) {
    const result = await db
      .update(scoringRules)
      .set({
        value,
        weight,
        updatedAt: new Date(),
      })
      .where(eq(scoringRules.id, id))
      .returning();
    return result[0] || null;
  }

  async updateRuleByParameter(strategy: string, parameterName: string, value: number, weight: number) {
    const result = await db
      .update(scoringRules)
      .set({
        value,
        weight,
        updatedAt: new Date(),
      })
      .where(and(eq(scoringRules.strategy, strategy), eq(scoringRules.parameterName, parameterName)))
      .returning();
    return result[0] || null;
  }
}
