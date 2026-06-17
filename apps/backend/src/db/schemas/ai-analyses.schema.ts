import {
  pgTable,
  serial,
  timestamp,
  varchar,
  text,
  integer,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const aiAnalyses = pgTable("ai_analyses", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id"),
  symbol: varchar("symbol", { length: 10 }).notNull().unique(),
  prediction: varchar("prediction", { length: 20 }).notNull(), // UP, DOWN, SIDEWAYS
  recommendation: varchar("recommendation", { length: 20 }).notNull(), // BUY, HOLD, AVOID
  confidence: doublePrecision("confidence").notNull(), // percentage 0-100
  aiDayScore: doublePrecision("ai_day_score"), // AI's own day trading score 0-100
  aiSwingScore: doublePrecision("ai_swing_score"), // AI's own swing trading score 0-100
  aiPositionScore: doublePrecision("ai_position_score"), // AI's own position trading score 0-100
  sysDayScore: doublePrecision("sys_day_score"), // System day trading score at analysis time
  sysSwingScore: doublePrecision("sys_swing_score"), // System swing trading score at analysis time
  sysPosScore: doublePrecision("sys_pos_score"), // System position trading score at analysis time
  scoreVerdict: varchar("score_verdict", { length: 20 }), // AGREE, PARTIAL, DISAGREE
  analysisDetail: text("analysis_detail").notNull(),
  scoreComparison: text("score_comparison").notNull(),
  macroEconomics: text("macro_economics").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AiAnalysis = typeof aiAnalyses.$inferSelect;
export type NewAiAnalysis = typeof aiAnalyses.$inferInsert;
