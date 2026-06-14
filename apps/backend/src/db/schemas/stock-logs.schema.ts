import {
  pgTable,
  serial,
  timestamp,
  varchar,
  integer,
  text,
} from "drizzle-orm/pg-core";

export const stockLogs = pgTable("stock_logs", {
  id: serial("id").primaryKey(),
  status: varchar("status", { length: 20 }).notNull(), // 'success' or 'failed'
  message: text("message"),
  symbolsCount: integer("symbols_count").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type StockLog = typeof stockLogs.$inferSelect;
export type NewStockLog = typeof stockLogs.$inferInsert;
