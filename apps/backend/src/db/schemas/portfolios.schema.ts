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

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  balance: numeric("balance", { precision: 20, scale: 4 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const portfolioAssets = pgTable("portfolio_assets", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id")
    .references(() => portfolios.id, { onDelete: "cascade" })
    .notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  quantity: numeric("quantity", { precision: 20, scale: 4 }).default("0").notNull(),
  averagePurchasePrice: numeric("average_purchase_price", { precision: 20, scale: 4 })
    .default("0")
    .notNull(),
  takeProfit: numeric("take_profit", { precision: 20, scale: 4 }),
  stopLoss: numeric("stop_loss", { precision: 20, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const portfolioTransactions = pgTable("portfolio_transactions", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id")
    .references(() => portfolios.id, { onDelete: "cascade" })
    .notNull(),
  symbol: varchar("symbol", { length: 10 }),
  type: varchar("type", { length: 20 }).notNull(), // BUY, SELL, DEPOSIT, WITHDRAW
  quantity: numeric("quantity", { precision: 20, scale: 4 }),
  price: numeric("price", { precision: 20, scale: 4 }),
  fee: numeric("fee", { precision: 20, scale: 4 }).default("0").notNull(),
  takeProfit: numeric("take_profit", { precision: 20, scale: 4 }),
  stopLoss: numeric("stop_loss", { precision: 20, scale: 4 }),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Portfolio = typeof portfolios.$inferSelect;
export type NewPortfolio = typeof portfolios.$inferInsert;

export type PortfolioAsset = typeof portfolioAssets.$inferSelect;
export type NewPortfolioAsset = typeof portfolioAssets.$inferInsert;

export type PortfolioTransaction = typeof portfolioTransactions.$inferSelect;
export type NewPortfolioTransaction = typeof portfolioTransactions.$inferInsert;
