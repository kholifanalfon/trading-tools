import { pgTable, serial, varchar, doublePrecision, integer, timestamp } from "drizzle-orm/pg-core";

export const scoringRules = pgTable("scoring_rules", {
  id: serial("id").primaryKey(),
  strategy: varchar("strategy", { length: 50 }).notNull(), // 'day', 'swing', 'position'
  parameterName: varchar("parameter_name", { length: 100 }).notNull(), // e.g., 'rvol_high', 'rsi_oversold'
  value: doublePrecision("value").notNull(),
  weight: integer("weight").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ScoringRule = typeof scoringRules.$inferSelect;
export type NewScoringRule = typeof scoringRules.$inferInsert;
