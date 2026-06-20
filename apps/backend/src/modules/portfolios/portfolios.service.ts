import { PortfoliosRepository } from "./portfolios.repository";
import { CreatePortfolioInput, UpdatePortfolioInput, AddTransactionInput } from "./portfolios.schema";
import { TradingJournalsRepository } from "../trading-journals/trading-journals.repository";

export class PortfoliosService {
  private repository = new PortfoliosRepository();
  private journalRepository = new TradingJournalsRepository();

  async getPortfolios(userId: number) {
    return this.repository.getPortfolios(userId);
  }

  async getPortfolioById(id: number, userId: number) {
    const portfolio = await this.repository.getPortfolioById(id, userId);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }
    const assets = await this.repository.getAssets(id);
    const transactions = await this.repository.getTransactions(id);
    return {
      ...portfolio,
      assets,
      transactions,
    };
  }

  async createPortfolio(userId: number, data: CreatePortfolioInput) {
    return this.repository.createPortfolio(userId, data);
  }

  async updatePortfolio(id: number, userId: number, data: UpdatePortfolioInput) {
    const portfolio = await this.repository.getPortfolioById(id, userId);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }
    return this.repository.updatePortfolio(id, userId, data);
  }

  async deletePortfolio(id: number, userId: number) {
    const portfolio = await this.repository.getPortfolioById(id, userId);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }
    return this.repository.deletePortfolio(id, userId);
  }

  async addTransaction(portfolioId: number, userId: number, data: AddTransactionInput) {
    const portfolio = await this.repository.getPortfolioById(portfolioId, userId);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }

    const currentBalance = Number(portfolio.balance);
    const type = data.type;
    const fee = Number(data.fee || 0);

    if (type === "DEPOSIT") {
      const amount = Number(data.price || 0); // Use price as amount for deposit
      const newBalance = currentBalance + amount - fee;
      if (newBalance < 0) throw new Error("Transaction fee exceeds deposit amount");
      
      const transaction = await this.repository.createTransaction(portfolioId, data);
      await this.repository.updatePortfolio(portfolioId, userId, { balance: newBalance.toString() });
      return transaction;
    }

    if (type === "WITHDRAW") {
      const amount = Number(data.price || 0); // Use price as amount for withdraw
      const newBalance = currentBalance - amount - fee;
      if (newBalance < 0) {
        throw new Error("Insufficient cash balance for withdrawal");
      }
      
      const transaction = await this.repository.createTransaction(portfolioId, data);
      await this.repository.updatePortfolio(portfolioId, userId, { balance: newBalance.toString() });
      return transaction;
    }

    // Handle BUY / SELL
    const symbol = data.symbol!;
    const qty = Number(data.quantity!);
    const price = Number(data.price!);
    const totalCost = qty * price;

    if (type === "BUY") {
      const cashNeeded = totalCost + fee;
      if (currentBalance < cashNeeded) {
        throw new Error(`Insufficient balance. Needed: ${cashNeeded}, Available: ${currentBalance}`);
      }

      // Create transaction
      const transaction = await this.repository.createTransaction(portfolioId, data);

      // Recalculate average purchase price
      const existingAsset = await this.repository.getAssetBySymbol(portfolioId, symbol);
      let newQty = qty;
      let newAvgPrice = price;

      if (existingAsset) {
        const oldQty = Number(existingAsset.quantity);
        const oldAvgPrice = Number(existingAsset.averagePurchasePrice);
        newQty = oldQty + qty;
        newAvgPrice = ((oldQty * oldAvgPrice) + (qty * price)) / newQty;
      }

      await this.repository.upsertAsset(portfolioId, symbol, newQty.toString(), newAvgPrice.toString(), data.takeProfit, data.stopLoss);
      await this.repository.updatePortfolio(portfolioId, userId, { balance: (currentBalance - cashNeeded).toString() });

      // Automatically create a draft OPEN entry in trading journal
      await this.journalRepository.createJournal(userId, {
        portfolioId,
        transactionId: transaction.id,
        symbol,
        direction: "LONG", // Default buy/sell as long trade
        entryPrice: price.toString(),
        quantity: qty.toString(),
        status: "OPEN",
        setup: "Auto-generated from Portfolio Buy",
        notes: `Automatically created on BUY transaction in portfolio "${portfolio.name}".`,
      });

      return transaction;
    }

    if (type === "SELL") {
      const existingAsset = await this.repository.getAssetBySymbol(portfolioId, symbol);
      if (!existingAsset || Number(existingAsset.quantity) < qty) {
        throw new Error(`Insufficient shares of ${symbol}. Available: ${existingAsset ? existingAsset.quantity : 0}, Required: ${qty}`);
      }

      const proceeds = totalCost - fee;

      // Create transaction
      const transaction = await this.repository.createTransaction(portfolioId, data);

      const oldQty = Number(existingAsset.quantity);
      const avgPurchasePrice = Number(existingAsset.averagePurchasePrice);
      const newQty = oldQty - qty;

      if (newQty <= 0) {
        await this.repository.deleteAsset(existingAsset.id);
      } else {
        await this.repository.upsertAsset(portfolioId, symbol, newQty.toString(), avgPurchasePrice.toString());
      }

      await this.repository.updatePortfolio(portfolioId, userId, { balance: (currentBalance + proceeds).toString() });

      // Calculate Realized PnL
      const realizedPnL = (price - avgPurchasePrice) * qty - fee;

      // Automatically create a CLOSED entry in trading journal
      await this.journalRepository.createJournal(userId, {
        portfolioId,
        transactionId: transaction.id,
        symbol,
        direction: "LONG", // Assuming exit of a long position
        entryPrice: avgPurchasePrice.toString(),
        exitPrice: price.toString(),
        quantity: qty.toString(),
        status: "CLOSED",
        pnl: realizedPnL.toString(),
        setup: "Auto-generated from Portfolio Sell",
        notes: `Automatically created on SELL transaction in portfolio "${portfolio.name}".`,
        entryDate: existingAsset.createdAt.toISOString(),
        exitDate: new Date().toISOString(),
      });

      return transaction;
    }

    throw new Error("Invalid transaction type");
  }

  async getPortfoliosAssetSummary(userId: number, symbol: string) {
    const assets = await this.repository.getAssetsBySymbol(userId, symbol);
    const transactions = await this.repository.getTransactionsBySymbol(userId, symbol);
    return {
      assets,
      transactions,
    };
  }

  async getAllAssets(userId: number) {
    return this.repository.getAllAssetsForUser(userId);
  }
}
