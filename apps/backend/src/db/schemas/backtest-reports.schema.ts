import { pgTable, serial, varchar, jsonb, text, timestamp } from "drizzle-orm/pg-core";

export const backtestReports = pgTable("backtest_reports", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  strategy: varchar("strategy", { length: 50 }).notNull(), // 'day', 'swing', 'position'
  parameters: jsonb("parameters").notNull(), // config used
  metrics: jsonb("metrics").notNull(), // return, win rate, Sharpe, drawdown
  trades: jsonb("trades").notNull(), // list of completed trades
  equityCurve: jsonb("equity_curve"), // equity curve data
  aiInsights: text("ai_insights"), // Gemini recommendation analysis text
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BacktestReport = typeof backtestReports.$inferSelect;
export type NewBacktestReport = typeof backtestReports.$inferInsert;
