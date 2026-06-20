import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  integer,
  numeric,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { portfolios, portfolioTransactions } from "./portfolios.schema";

export const tradingJournals = pgTable("trading_journals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id, {
    onDelete: "set null",
  }),
  transactionId: integer("transaction_id").references(
    () => portfolioTransactions.id,
    { onDelete: "set null" }
  ),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  direction: varchar("direction", { length: 10 }).notNull(), // LONG, SHORT
  entryDate: timestamp("entry_date").defaultNow().notNull(),
  exitDate: timestamp("exit_date"),
  entryPrice: numeric("entry_price", { precision: 20, scale: 4 }).notNull(),
  exitPrice: numeric("exit_price", { precision: 20, scale: 4 }),
  quantity: numeric("quantity", { precision: 20, scale: 4 }).notNull(),
  status: varchar("status", { length: 20 }).default("OPEN").notNull(), // OPEN, CLOSED
  pnl: numeric("pnl", { precision: 20, scale: 4 }),
  setup: varchar("setup", { length: 100 }),
  notes: text("notes"),
  emotions: varchar("emotions", { length: 100 }),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TradingJournal = typeof tradingJournals.$inferSelect;
export type NewTradingJournal = typeof tradingJournals.$inferInsert;
