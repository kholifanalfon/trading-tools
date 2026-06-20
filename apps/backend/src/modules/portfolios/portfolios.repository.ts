import { eq, and } from "drizzle-orm";
import { db } from "@/db/db";
import { portfolios, portfolioAssets, portfolioTransactions } from "@/db/schema";
import { CreatePortfolioInput, UpdatePortfolioInput, AddTransactionInput } from "./portfolios.schema";

export class PortfoliosRepository {
  async getPortfolios(userId: number) {
    return db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .orderBy(portfolios.name);
  }

  async getPortfolioById(id: number, userId: number) {
    const result = await db
      .select()
      .from(portfolios)
      .where(and(eq(portfolios.id, id), eq(portfolios.userId, userId)))
      .limit(1);
    return result[0] || null;
  }

  async createPortfolio(userId: number, data: CreatePortfolioInput) {
    const result = await db
      .insert(portfolios)
      .values({
        userId,
        name: data.name,
        description: data.description,
        balance: data.balance,
      })
      .returning();
    return result[0];
  }

  async updatePortfolio(id: number, userId: number, data: UpdatePortfolioInput & { balance?: string }) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.balance !== undefined) updateData.balance = data.balance;
    updateData.updatedAt = new Date();

    const result = await db
      .update(portfolios)
      .set(updateData)
      .where(and(eq(portfolios.id, id), eq(portfolios.userId, userId)))
      .returning();
    return result[0] || null;
  }

  async deletePortfolio(id: number, userId: number) {
    const result = await db
      .delete(portfolios)
      .where(and(eq(portfolios.id, id), eq(portfolios.userId, userId)))
      .returning();
    return result[0] || null;
  }

  async getAssets(portfolioId: number) {
    return db
      .select()
      .from(portfolioAssets)
      .where(eq(portfolioAssets.portfolioId, portfolioId))
      .orderBy(portfolioAssets.symbol);
  }

  async getAssetBySymbol(portfolioId: number, symbol: string) {
    const result = await db
      .select()
      .from(portfolioAssets)
      .where(
        and(
          eq(portfolioAssets.portfolioId, portfolioId),
          eq(portfolioAssets.symbol, symbol)
        )
      )
      .limit(1);
    return result[0] || null;
  }

  async upsertAsset(portfolioId: number, symbol: string, quantity: string, averagePurchasePrice: string, takeProfit?: string | null, stopLoss?: string | null) {
    const existing = await this.getAssetBySymbol(portfolioId, symbol);
    if (existing) {
      const result = await db
        .update(portfolioAssets)
        .set({
          quantity,
          averagePurchasePrice,
          takeProfit: takeProfit !== undefined ? takeProfit : existing.takeProfit,
          stopLoss: stopLoss !== undefined ? stopLoss : existing.stopLoss,
          updatedAt: new Date(),
        })
        .where(eq(portfolioAssets.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db
        .insert(portfolioAssets)
        .values({
          portfolioId,
          symbol,
          quantity,
          averagePurchasePrice,
          takeProfit: takeProfit || null,
          stopLoss: stopLoss || null,
        })
        .returning();
      return result[0];
    }
  }

  async deleteAsset(id: number) {
    const result = await db
      .delete(portfolioAssets)
      .where(eq(portfolioAssets.id, id))
      .returning();
    return result[0] || null;
  }

  async getTransactions(portfolioId: number) {
    return db
      .select()
      .from(portfolioTransactions)
      .where(eq(portfolioTransactions.portfolioId, portfolioId))
      .orderBy(portfolioTransactions.transactionDate);
  }

  async createTransaction(portfolioId: number, data: AddTransactionInput) {
    const result = await db
      .insert(portfolioTransactions)
      .values({
        portfolioId,
        symbol: data.symbol,
        type: data.type,
        quantity: data.quantity,
        price: data.price,
        fee: data.fee,
        takeProfit: data.takeProfit,
        stopLoss: data.stopLoss,
        transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
        notes: data.notes,
      })
      .returning();
    return result[0];
  }

  async getAssetsBySymbol(userId: number, symbol: string) {
    return db
      .select({
        id: portfolioAssets.id,
        portfolioId: portfolioAssets.portfolioId,
        portfolioName: portfolios.name,
        symbol: portfolioAssets.symbol,
        quantity: portfolioAssets.quantity,
        averagePurchasePrice: portfolioAssets.averagePurchasePrice,
        takeProfit: portfolioAssets.takeProfit,
        stopLoss: portfolioAssets.stopLoss,
        createdAt: portfolioAssets.createdAt,
        updatedAt: portfolioAssets.updatedAt,
      })
      .from(portfolioAssets)
      .innerJoin(portfolios, eq(portfolioAssets.portfolioId, portfolios.id))
      .where(and(eq(portfolios.userId, userId), eq(portfolioAssets.symbol, symbol)));
  }

  async getTransactionsBySymbol(userId: number, symbol: string) {
    return db
      .select({
        id: portfolioTransactions.id,
        portfolioId: portfolioTransactions.portfolioId,
        portfolioName: portfolios.name,
        symbol: portfolioTransactions.symbol,
        type: portfolioTransactions.type,
        quantity: portfolioTransactions.quantity,
        price: portfolioTransactions.price,
        fee: portfolioTransactions.fee,
        takeProfit: portfolioTransactions.takeProfit,
        stopLoss: portfolioTransactions.stopLoss,
        transactionDate: portfolioTransactions.transactionDate,
        notes: portfolioTransactions.notes,
        createdAt: portfolioTransactions.createdAt,
      })
      .from(portfolioTransactions)
      .innerJoin(portfolios, eq(portfolioTransactions.portfolioId, portfolios.id))
      .where(and(eq(portfolios.userId, userId), eq(portfolioTransactions.symbol, symbol)))
      .orderBy(portfolioTransactions.transactionDate);
  }

  async getAllAssetsForUser(userId: number) {
    return db
      .select({
        id: portfolioAssets.id,
        portfolioId: portfolioAssets.portfolioId,
        portfolioName: portfolios.name,
        symbol: portfolioAssets.symbol,
        quantity: portfolioAssets.quantity,
        averagePurchasePrice: portfolioAssets.averagePurchasePrice,
        takeProfit: portfolioAssets.takeProfit,
        stopLoss: portfolioAssets.stopLoss,
        createdAt: portfolioAssets.createdAt,
        updatedAt: portfolioAssets.updatedAt,
      })
      .from(portfolioAssets)
      .innerJoin(portfolios, eq(portfolioAssets.portfolioId, portfolios.id))
      .where(eq(portfolios.userId, userId))
      .orderBy(portfolioAssets.symbol);
  }
}
