import { StocksRepository } from "./stocks.repository";
import { CreateStockInput, UpdateStockInput, StockQueryInput } from "./stocks.schema";
import { DataNotFoundError } from "@/core/errors/data-not-found-error";
import { DataExistError } from "@/core/errors/data-exist-error";

export class StocksService {
  private repository = new StocksRepository();

  async getStocks(query: StockQueryInput) {
    return this.repository.getStocks(query);
  }

  async getStockById(id: number) {
    const stock = await this.repository.getStockById(id);
    if (!stock) {
      throw new DataNotFoundError("Stock not found");
    }
    return stock;
  }

  async createStock(data: CreateStockInput) {
    const existing = await this.repository.getStockBySymbol(data.symbol);
    if (existing) {
      throw new DataExistError("Stock ticker symbol is already registered");
    }
    return this.repository.createStock(data);
  }

  async updateStock(id: number, data: UpdateStockInput) {
    const existing = await this.repository.getStockById(id);
    if (!existing) {
      throw new DataNotFoundError("Stock not found");
    }

    if (data.symbol) {
      const duplicate = await this.repository.getStockBySymbol(data.symbol);
      if (duplicate && duplicate.id !== id) {
        throw new DataExistError("Stock ticker symbol is already registered by another record");
      }
    }

    return this.repository.updateStock(id, data);
  }

  async deleteStock(id: number) {
    const existing = await this.repository.getStockById(id);
    if (!existing) {
      throw new DataNotFoundError("Stock not found");
    }
    return this.repository.deleteStock(id);
  }
}
