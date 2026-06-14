import {
  pgTable,
  serial,
  timestamp,
  varchar,
  integer,
  doublePrecision,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";
import { stocks } from "./stocks.schema";

export const stockData = pgTable(
  "stock_data",
  {
    id: serial("id").primaryKey(),
    stockId: integer("stock_id")
      .references(() => stocks.id, { onDelete: "cascade" })
      .notNull(),
    symbol: varchar("symbol", { length: 10 }).notNull(),
    date: timestamp("date").notNull(),
    open: doublePrecision("open").notNull(),
    high: doublePrecision("high").notNull(),
    low: doublePrecision("low").notNull(),
    close: doublePrecision("close").notNull(),
    volume: doublePrecision("volume").notNull(),
    ema9: doublePrecision("ema_9"),
    ema21: doublePrecision("ema_21"),
    ema50: doublePrecision("ema_50"),
    ema200: doublePrecision("ema_200"),
    rsi: doublePrecision("rsi"),
    macd: doublePrecision("macd"),
    macdSignal: doublePrecision("macd_signal"),
    macdHist: doublePrecision("macd_hist"),
    change: doublePrecision("change"),
    changePercent: doublePrecision("change_percent"),
    dayScore: integer("day_score"),
    swingScore: integer("swing_score"),
    positionScore: integer("position_score"),
    scorePayload: jsonb("score_payload"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    symbolDateIdx: uniqueIndex("symbol_date_idx").on(table.symbol, table.date),
  }),
);

export type StockData = typeof stockData.$inferSelect;
export type NewStockData = typeof stockData.$inferInsert;
