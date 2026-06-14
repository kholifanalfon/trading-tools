import {
  pgTable,
  serial,
  timestamp,
  varchar,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  sector: varchar("sector", { length: 50 }).notNull(),
  price: integer("price").notNull(),
  watchlist: boolean("watchlist").default(false).notNull(),
  exchange: varchar("exchange", { length: 20 }).default("IDX").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Stock = typeof stocks.$inferSelect;
export type NewStock = typeof stocks.$inferInsert;
