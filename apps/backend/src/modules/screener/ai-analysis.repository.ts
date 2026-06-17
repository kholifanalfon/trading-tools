import { db } from "@/db/db";
import { aiAnalyses, NewAiAnalysis } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export class AiAnalysisRepository {
  async getAnalysisBySymbol(symbol: string) {
    const results = await db
      .select()
      .from(aiAnalyses)
      .where(eq(aiAnalyses.symbol, symbol.toUpperCase().trim()))
      .limit(1);
    return results[0] || null;
  }

  async upsertAnalysis(data: NewAiAnalysis) {
    const result = await db
      .insert(aiAnalyses)
      .values({
        ...data,
        symbol: data.symbol.toUpperCase().trim(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: aiAnalyses.symbol,
        set: {
          prediction: sql`EXCLUDED.prediction`,
          recommendation: sql`EXCLUDED.recommendation`,
          confidence: sql`EXCLUDED.confidence`,
          aiDayScore: sql`EXCLUDED.ai_day_score`,
          aiSwingScore: sql`EXCLUDED.ai_swing_score`,
          aiPositionScore: sql`EXCLUDED.ai_position_score`,
          sysDayScore: sql`EXCLUDED.sys_day_score`,
          sysSwingScore: sql`EXCLUDED.sys_swing_score`,
          sysPosScore: sql`EXCLUDED.sys_pos_score`,
          scoreVerdict: sql`EXCLUDED.score_verdict`,
          analysisDetail: sql`EXCLUDED.analysis_detail`,
          scoreComparison: sql`EXCLUDED.score_comparison`,
          macroEconomics: sql`EXCLUDED.macro_economics`,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }
}
