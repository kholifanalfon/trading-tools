import { eq, and } from "drizzle-orm";
import { db } from "@/db/db";
import { tradingJournals } from "@/db/schema";
import { CreateTradingJournalInput, UpdateTradingJournalInput } from "./trading-journals.schema";

export class TradingJournalsRepository {
  async getJournals(userId: number) {
    return db
      .select()
      .from(tradingJournals)
      .where(eq(tradingJournals.userId, userId))
      .orderBy(tradingJournals.entryDate);
  }

  async getJournalById(id: number, userId: number) {
    const result = await db
      .select()
      .from(tradingJournals)
      .where(and(eq(tradingJournals.id, id), eq(tradingJournals.userId, userId)))
      .limit(1);
    return result[0] || null;
  }

  async createJournal(userId: number, data: CreateTradingJournalInput) {
    const result = await db
      .insert(tradingJournals)
      .values({
        userId,
        portfolioId: data.portfolioId,
        transactionId: data.transactionId,
        symbol: data.symbol,
        direction: data.direction,
        entryPrice: data.entryPrice,
        exitPrice: data.exitPrice,
        quantity: data.quantity,
        status: data.status,
        pnl: data.pnl,
        setup: data.setup,
        notes: data.notes,
        emotions: data.emotions,
        rating: data.rating,
        entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
        exitDate: data.exitDate ? new Date(data.exitDate) : undefined,
      })
      .returning();
    return result[0];
  }

  async updateJournal(id: number, userId: number, data: UpdateTradingJournalInput) {
    const updateData: any = {};
    if (data.portfolioId !== undefined) updateData.portfolioId = data.portfolioId;
    if (data.transactionId !== undefined) updateData.transactionId = data.transactionId;
    if (data.symbol !== undefined) updateData.symbol = data.symbol;
    if (data.direction !== undefined) updateData.direction = data.direction;
    if (data.entryPrice !== undefined) updateData.entryPrice = data.entryPrice;
    if (data.exitPrice !== undefined) updateData.exitPrice = data.exitPrice;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.pnl !== undefined) updateData.pnl = data.pnl;
    if (data.setup !== undefined) updateData.setup = data.setup;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.emotions !== undefined) updateData.emotions = data.emotions;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.entryDate !== undefined) updateData.entryDate = data.entryDate ? new Date(data.entryDate) : null;
    if (data.exitDate !== undefined) updateData.exitDate = data.exitDate ? new Date(data.exitDate) : null;
    updateData.updatedAt = new Date();

    const result = await db
      .update(tradingJournals)
      .set(updateData)
      .where(and(eq(tradingJournals.id, id), eq(tradingJournals.userId, userId)))
      .returning();
    return result[0] || null;
  }

  async deleteJournal(id: number, userId: number) {
    const result = await db
      .delete(tradingJournals)
      .where(and(eq(tradingJournals.id, id), eq(tradingJournals.userId, userId)))
      .returning();
    return result[0] || null;
  }
}
