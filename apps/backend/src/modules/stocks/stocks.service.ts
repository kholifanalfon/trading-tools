import { StocksRepository } from "./stocks.repository";
import { CreateStockInput, UpdateStockInput, StockQueryInput, SyncState } from "./stocks.schema";
import { DataNotFoundError } from "@/core/errors/data-not-found-error";
import { DataExistError } from "@/core/errors/data-exist-error";
import { SettingsRepository } from "../settings/settings.repository";
import { decrypt } from "@/core/utils/crypto";
import { GeminiApiError } from "@/core/errors/gemini-api-error";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError } from "@/core/errors/app-error";
import { webSocketService } from "@/core/websocket";

let currentSyncState: SyncState = {
  status: "idle",
  error: null,
  lastSyncAt: null,
};

export class StocksService {
  private repository = new StocksRepository();

  getSyncState(): SyncState {
    return currentSyncState;
  }

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

  async syncStocks() {
    if (currentSyncState.status === "running") {
      throw new AppError("A stock synchronization process is already running.", 409);
    }

    currentSyncState = {
      status: "running",
      error: null,
      lastSyncAt: currentSyncState.lastSyncAt,
    };

    try {
      const settingsRepo = new SettingsRepository();
      const apiKeySetting = await settingsRepo.getSettingByKey("gemini_api_key");
      const modelSetting = await settingsRepo.getSettingByKey("gemini_model");

      const encryptedApiKey = apiKeySetting?.value;
      const model = modelSetting?.value || "gemini-1.5-flash";

      if (!encryptedApiKey) {
        throw new GeminiApiError("Gemini API key is not configured. Please set it in Settings.");
      }

      const apiKey = decrypt(encryptedApiKey);

      let parsedList: Array<{ symbol: string; name: string; sector: string; price: number }>;
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelInstance = genAI.getGenerativeModel({
          model: model,
          systemInstruction: "You are a financial analyst specializing in stock recommendations.",
        });

        const responseSchema = {
          type: "ARRAY" as const,
          description: "List of recommended profitable stocks for trading",
          items: {
            type: "OBJECT" as const,
            properties: {
              symbol: {
                type: "STRING" as const,
                description: "Ticker symbol of the stock in uppercase (max 10 characters, e.g. BBCA, AAPL)",
              },
              name: {
                type: "STRING" as const,
                description: "Full name of the company",
              },
              sector: {
                type: "STRING" as const,
                description: "Business sector of the company",
              },
              price: {
                type: "INTEGER" as const,
                description: "Realistic stock price in IDR",
              },
            },
            required: ["symbol", "name", "sector", "price"],
          },
        };

        const result = await modelInstance.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: "Recommend exactly 50 profitable stock ticker symbols currently suitable for trading. Include mixed global and Indonesian stock tickers (e.g. AAPL, MSFT, BBCA, TLKM).",
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema as any,
          },
        });

        const textResponse = result.response.text();
        if (!textResponse) {
          throw new GeminiApiError("No response received from Gemini AI model.");
        }

        parsedList = JSON.parse(textResponse.trim());
      } catch (error) {
        if (error instanceof GeminiApiError) {
          throw error;
        }
        throw new GeminiApiError(
          `Gemini API execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }

      if (!Array.isArray(parsedList)) {
        throw new GeminiApiError("Gemini AI did not return an array format.");
      }

      const upsertedStocks = [];
      for (const item of parsedList) {
        if (item.symbol && item.name && item.sector && typeof item.price === "number") {
          const result = await this.repository.upsertStock({
            symbol: item.symbol.toUpperCase().trim(),
            name: item.name.trim(),
            sector: item.sector.trim(),
            price: Math.round(item.price),
          });
          upsertedStocks.push(result);
        }
      }

      currentSyncState = {
        status: "success",
        error: null,
        lastSyncAt: new Date().toISOString(),
      };

      webSocketService.broadcast(["stocks", "sync-status"], {
        status: "success",
        lastSyncAt: currentSyncState.lastSyncAt,
      });

      return { success: true, count: upsertedStocks.length, items: upsertedStocks };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      currentSyncState = {
        status: "failed",
        error: errMsg,
        lastSyncAt: new Date().toISOString(),
      };

      webSocketService.broadcast(["stocks", "sync-status"], {
        status: "failed",
        error: errMsg,
        lastSyncAt: currentSyncState.lastSyncAt,
      });

      throw error;
    }
  }
}




