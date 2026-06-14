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
      const exchangesSetting = await settingsRepo.getSettingByKey("exchanges_config");

      const encryptedApiKey = apiKeySetting?.value;
      const model = modelSetting?.value || "gemini-1.5-flash";

      if (!encryptedApiKey) {
        throw new GeminiApiError("Gemini API key is not configured. Please set it in Settings.");
      }

      const apiKey = decrypt(encryptedApiKey);

      let activeExchanges: any[] = [];
      if (exchangesSetting?.value) {
        try {
          const parsed = JSON.parse(exchangesSetting.value);
          activeExchanges = parsed.filter((ex: any) => ex.enabled);
        } catch (err) {
          console.error("Failed to parse exchanges_config:", err);
        }
      }

      if (activeExchanges.length === 0) {
        activeExchanges = [
          { name: "IDX / BEI", suffix: ".JK", country: "Indonesia" },
          { name: "NYSE", suffix: "", country: "USA" },
          { name: "NASDAQ", suffix: "", country: "USA" },
        ];
      }

      const exchangesPromptList = activeExchanges
        .map(
          (ex: any) =>
            `- ${ex.name} (Country: ${ex.country}): Recommend exactly ${ex.limit || 15} ticker symbols. Tickers from this exchange MUST use the suffix "${ex.suffix}" in Yahoo Finance formatting (e.g., if suffix is .JK, BBCA becomes BBCA.JK)`
        )
        .join("\n");

      const totalLimit = activeExchanges.reduce((sum, ex) => sum + (ex.limit || 15), 0);

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
                description: "Ticker symbol of the stock with its Yahoo Finance suffix in uppercase (e.g. BBCA.JK, AAPL)",
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
                description: "Realistic stock price in IDR or USD equivalent in IDR",
              },
            },
            required: ["symbol", "name", "sector", "price"],
          },
        };

        const promptText = `Recommend exactly ${totalLimit} stock ticker symbols that are currently highly profitable (generating positive net income/earnings) and have shown strong performance recently, and are highly suitable for active trading strategies such as Day Trading (high intraday volume and momentum), Swing Trading (clear medium-term trend and setups), or Position Trading (strong steady uptrends and growth).
You MUST ONLY recommend tickers from the following enabled stock exchanges:
${exchangesPromptList}

For each stock, ensure you format the symbol EXACTLY as required by Yahoo Finance for that exchange (e.g., BBCA.JK for Indonesian stocks, AAPL for NASDAQ/NYSE stocks).
Strictly enforce the formatting rules above. Do not output tickers without the required suffix.`;

        const result = await modelInstance.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: promptText,
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
          const sym = item.symbol.toUpperCase().trim();
          let exchange = "NYSE";
          if (sym.endsWith(".JK")) {
            exchange = "IDX";
          } else {
            // Find in activeExchanges configs
            const matchedEx = activeExchanges.find(ex => ex.suffix && sym.endsWith(ex.suffix.toUpperCase()));
            if (matchedEx) {
              exchange = matchedEx.name.includes("IDX") ? "IDX" : matchedEx.name.split(" ")[0];
            }
          }
          const result = await this.repository.upsertStock({
            symbol: sym,
            name: item.name.trim(),
            sector: item.sector.trim(),
            price: Math.round(item.price),
            exchange: exchange,
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




