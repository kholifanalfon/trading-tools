import { db } from "@/db/db";
import { backtestReports, scoringRules } from "@/db/schema";
import { YahooFinanceAdapter } from "@/core/adapters/yahoo-finance.adapter";
import { runBacktestSimulation, BacktestParams, BacktestResult } from "./backtest.engine";
import { webSocketService } from "@/core/websocket";
import { runStrategyOptimization, runMultiStockOptimization, OptimizationGridItem } from "./backtest.optimizer";
import { SettingsClientService } from "../settings/settings-client.services";
import { mapRulesToConfig } from "@/core/utils/scoring.utils";
import { SettingsRepository } from "../settings/settings.repository";
import { GeminiAdapter } from "@/core/adapters/gemini.adapter";
import { decrypt } from "@/core/utils/crypto";
import { AppError } from "@/core/errors/app-error";
import { eq, desc } from "drizzle-orm";

export interface RunBacktestDto {
  symbol: string;
  strategy: "day" | "swing" | "position";
  buyThreshold: number;
  sellThreshold: number;
  stopLossPercent: number;
  takeProfitPercent: number;
}

export class BacktestService {
  private settingsRepo = new SettingsRepository();
  private stockAdapter = new YahooFinanceAdapter();
  private settingsClient = new SettingsClientService();

  private async getGeminiAdapter(): Promise<GeminiAdapter> {
    const list = await this.settingsRepo.getAllSettings();
    const configObj: Record<string, string> = {};
    for (const item of list) {
      configObj[item.key] = item.value;
    }

    const encryptedKey = configObj.gemini_api_key;
    const apiKey = encryptedKey ? decrypt(encryptedKey) : "";
    const model = configObj.gemini_model || "gemini-1.5-flash";

    return new GeminiAdapter(apiKey, model);
  }

  async runBacktest(dto: RunBacktestDto) {
    const { symbol, strategy, buyThreshold, sellThreshold, stopLossPercent, takeProfitPercent } = dto;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365); // 1 year history

    // Fetch history
    let ticker = symbol.toUpperCase();
    let candles = await this.stockAdapter.getHistoricalData(ticker, startDate, new Date());
    if (candles.length === 0 && ticker.length === 4) {
      ticker = `${ticker}.JK`;
      candles = await this.stockAdapter.getHistoricalData(ticker, startDate, new Date());
    }

    if (candles.length === 0) {
      throw new AppError(`No historical candle data found for symbol ${symbol}`, 404);
    }

    // Retrieve active scoring rules from DB
    const dbRules = await db.select().from(scoringRules);
    const rulesConfig = mapRulesToConfig(dbRules);

    const params: BacktestParams = {
      strategy,
      rulesConfig,
      buyThreshold,
      sellThreshold,
      stopLossPercent,
      takeProfitPercent,
    };

    const result = runBacktestSimulation(symbol, candles, params);

    // Call Gemini AI analysis
    let aiInsights = "";
    try {
      const gemini = await this.getGeminiAdapter();
      const prompt = `
        You are an expert trading advisor. Analyze the following backtesting performance metrics for stock ticker "${symbol}" using strategy "${strategy}":
        - Initial Capital: IDR ${result.initialCapital.toLocaleString()}
        - Final Capital: IDR ${result.finalCapital.toLocaleString()}
        - Total Return: ${result.totalReturnPercent.toFixed(2)}%
        - Win Rate: ${result.winRatePercent.toFixed(2)}%
        - Max Drawdown: ${result.maxDrawdownPercent.toFixed(2)}%
        - Sharpe Ratio: ${result.sharpeRatio.toFixed(2)}
        - Total Trades Executed: ${result.totalTrades}
        - Winning Trades: ${result.winningTrades}
        - Losing Trades: ${result.losingTrades}

        Provide a concise, professional analysis (max 3 short paragraphs) in Indonesian:
        1. Evaluate the overall profitability and risk (drawdown, Sharpe ratio).
        2. Suggest whether the strategy parameter settings (Buy Threshold: ${buyThreshold}, Sell Threshold: ${sellThreshold}, Stop Loss: ${stopLossPercent}%, Take Profit: ${takeProfitPercent}%) are optimal or should be adjusted.
        3. Give 1 actionable recommendation for trading this specific ticker.
      `;
      aiInsights = await gemini.generateAnalysis(prompt);
    } catch (err) {
      console.error("Gemini analysis failed in backtest:", err);
      aiInsights = "Analisis AI tidak dapat dimuat karena API Key Gemini belum dikonfigurasi atau tidak valid.";
    }

    // Save report to database
    const saved = await db
      .insert(backtestReports)
      .values({
        symbol,
        strategy,
        parameters: { buyThreshold, sellThreshold, stopLossPercent, takeProfitPercent },
        metrics: {
          initialCapital: result.initialCapital,
          finalCapital: result.finalCapital,
          totalReturnPercent: result.totalReturnPercent,
          winRatePercent: result.winRatePercent,
          maxDrawdownPercent: result.maxDrawdownPercent,
          sharpeRatio: result.sharpeRatio,
          totalTrades: result.totalTrades,
        },
        trades: result.trades,
        equityCurve: result.equityCurve,
        aiInsights,
      })
      .returning();

    return {
      reportId: saved[0].id,
      result,
      aiInsights,
    };
  }

  private logAndBroadcast(message: string) {
    console.log(message);
    webSocketService.broadcast(["backtest", "optimize-log"], {
      message,
    });
  }

  async runOptimization(dto: RunBacktestDto) {
    const { symbol, strategy, buyThreshold, sellThreshold, stopLossPercent, takeProfitPercent } = dto;

    this.logAndBroadcast(`[Optimization] Starting single-stock optimization for ${symbol}`);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365); // 1 year history

    let ticker = symbol.toUpperCase();
    this.logAndBroadcast(`[Optimization] Fetching candles history for ${ticker}`);
    let candles = await this.stockAdapter.getHistoricalData(ticker, startDate, new Date());
    if (candles.length === 0 && ticker.length === 4) {
      ticker = `${ticker}.JK`;
      this.logAndBroadcast(`[Optimization] Retrying query with Indonesian suffix: ${ticker}`);
      candles = await this.stockAdapter.getHistoricalData(ticker, startDate, new Date());
    }

    if (candles.length === 0) {
      this.logAndBroadcast(`[Optimization] [ERROR] No historical data found for ${symbol}`);
      throw new AppError(`No historical candle data found for symbol ${symbol}`, 404);
    }

    this.logAndBroadcast(`[Optimization] Loaded ${candles.length} candles. Retrieving active scoring rules`);
    const dbRules = await db.select().from(scoringRules);
    const rulesConfig = mapRulesToConfig(dbRules);

    // Calculate baseline metrics before optimization
    this.logAndBroadcast(`[Optimization] Simulating baseline strategy performance...`);
    const baseResult = runBacktestSimulation(symbol, candles, {
      strategy,
      rulesConfig,
      buyThreshold,
      sellThreshold,
      stopLossPercent,
      takeProfitPercent,
    });

    this.logAndBroadcast(`[Optimization] Running Grid Search simulation...`);
    const optimizationGrid = runStrategyOptimization(
      symbol,
      candles,
      strategy,
      rulesConfig,
      buyThreshold,
      sellThreshold,
      stopLossPercent,
      takeProfitPercent,
      (msg) => this.logAndBroadcast(`[Optimization] ${msg}`)
    );

    this.logAndBroadcast(`[Optimization] [SUCCESS] Grid search completed!`);
    return {
      baseline: {
        totalReturnPercent: baseResult.totalReturnPercent,
        winRatePercent: baseResult.winRatePercent,
        maxDrawdownPercent: baseResult.maxDrawdownPercent,
        totalTrades: baseResult.totalTrades,
      },
      grid: optimizationGrid,
    };
  }

  async runMultiStockOptimization(dto: Omit<RunBacktestDto, "symbol">) {
    const { strategy, buyThreshold, sellThreshold, stopLossPercent, takeProfitPercent } = dto;

    this.logAndBroadcast(`[Optimization] Starting global multi-stock optimization`);
    const exchanges = await this.settingsClient.getExchanges();
    const regions = exchanges.map((e) => e.countryId);

    // Fetch screened stocks from live screener
    this.logAndBroadcast(`[Optimization] Fetching top 8 stocks matching ${strategy} strategy...`);
    const screenedStocks = await this.stockAdapter.getScreenedStocks(strategy, regions, 8, 1);
    const symbols = screenedStocks.map((s) => s.symbol);

    if (symbols.length === 0) {
      this.logAndBroadcast(`[Optimization] [ERROR] No stocks found for strategy ${strategy}`);
      throw new AppError("No stock symbols found in live screener to run multi-stock optimization", 404);
    }

    this.logAndBroadcast(`[Optimization] Found: ${symbols.join(", ")}. Loading 1-year history for all symbols`);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365); // 1 year history

    const candlesMap: Record<string, any[]> = {};

    // Fetch candles for each symbol
    await Promise.all(
      symbols.map(async (symbol) => {
        let ticker = symbol.toUpperCase();
        this.logAndBroadcast(`[Optimization] Fetching history for ${ticker}...`);
        let points = await this.stockAdapter.getHistoricalData(ticker, startDate, new Date());
        if (points.length === 0 && ticker.length === 4) {
          ticker = `${ticker}.JK`;
          points = await this.stockAdapter.getHistoricalData(ticker, startDate, new Date());
        }
        candlesMap[symbol] = points;
      })
    );

    this.logAndBroadcast(`[Optimization] Historical data loaded. Retrieving active scoring rules`);
    const dbRules = await db.select().from(scoringRules);
    const rulesConfig = mapRulesToConfig(dbRules);

    // Calculate baseline metrics before optimization across all stocks
    this.logAndBroadcast(`[Optimization] Simulating baseline strategy performance across all stocks...`);
    let totalReturnSum = 0;
    let winRateSum = 0;
    let maxDrawdownSum = 0;
    let totalTradesSum = 0;
    let activeCount = 0;

    for (const symbol of symbols) {
      const candles = candlesMap[symbol];
      if (!candles || candles.length === 0) continue;

      const result = runBacktestSimulation(symbol, candles, {
        strategy,
        rulesConfig,
        buyThreshold,
        sellThreshold,
        stopLossPercent,
        takeProfitPercent,
      });

      totalReturnSum += result.totalReturnPercent;
      winRateSum += result.winRatePercent;
      maxDrawdownSum += result.maxDrawdownPercent;
      totalTradesSum += result.totalTrades;
      activeCount++;
    }

    const divisor = activeCount || 1;

    this.logAndBroadcast(`[Optimization] Running global Grid Search simulation...`);
    const optimizationGrid = runMultiStockOptimization(
      symbols,
      candlesMap,
      strategy,
      rulesConfig,
      buyThreshold,
      sellThreshold,
      stopLossPercent,
      takeProfitPercent,
      (msg) => this.logAndBroadcast(`[Optimization] ${msg}`)
    );

    this.logAndBroadcast(`[Optimization] [SUCCESS] Global optimization completed successfully!`);
    return {
      symbols,
      baseline: {
        totalReturnPercent: totalReturnSum / divisor,
        winRatePercent: winRateSum / divisor,
        maxDrawdownPercent: maxDrawdownSum / divisor,
        totalTrades: totalTradesSum,
      },
      grid: optimizationGrid,
    };
  }

  async getReports() {
    return db.select().from(backtestReports).orderBy(desc(backtestReports.createdAt)).limit(10);
  }

  async getAiAlternative(dto: {
    strategy: "day" | "swing" | "position";
    beforeParams: Record<string, number>;
    beforeMetrics: Record<string, number>;
    afterParams: Record<string, number>;
    afterMetrics: Record<string, number>;
  }) {
    const { strategy, beforeParams, beforeMetrics, afterParams, afterMetrics } = dto;
    const gemini = await this.getGeminiAdapter();

    const prompt = `
You are an expert quantitative trading advisor.
The user is backtesting a trading strategy of type: "${strategy}".
Here is the comparison between the current configuration (Before) and the optimized configuration (After) found via grid search.

Before Configuration:
- Parameters: ${JSON.stringify(beforeParams)}
- Performance Metrics: ${JSON.stringify(beforeMetrics)}

After Configuration:
- Parameters: ${JSON.stringify(afterParams)}
- Performance Metrics: ${JSON.stringify(afterMetrics)}

Please propose an Alternative Configuration ("AI Suggestion") that tries to further optimize the strategy (e.g., maximizing Sharpe ratio, reducing drawdown, or increasing win rate). 

IMPORTANT: Make sure to evaluate and suggest alternative values for BOTH parameter threshold adjustments (such as buyThreshold, sellThreshold, stopLossPercent, takeProfitPercent) and indicator weights. Do not leave out the threshold adjustments.

You must return your response in raw JSON format, containing exactly:
- "alternativeParams": a flat JSON object where each key is a parameter name or weight override (prefixed with "_weight:"), and the value is an object containing:
  - "value" (number): the proposed value.
  - "reason" (string): a short explanation in Indonesian (max 15 words) of why this specific parameter or weight was chosen or adjusted compared to Before/After.
- "alternativeMetrics": a JSON object representing the expected performance metrics of your proposed alternative configuration, containing:
  - "totalReturnPercent" (number): expected total return percentage.
  - "winRatePercent" (number): expected win rate percentage.
  - "maxDrawdownPercent" (number): expected max drawdown percentage.
  - "totalTrades" (number): expected number of total trades.

For example, the keys in "alternativeParams" must only be the parameter keys from "Before" or "After", such as:
- Threshold keys: "buyThreshold", "sellThreshold", "stopLossPercent", "takeProfitPercent", "rvol_high_threshold", "rsi_oversold", "rsi_neutral_low", "proximity_ema20_percent", "strength_52w_high_diff", "volatility_atr_low".
- Weight overrides: "_weight:<parameter_name>". E.g., "_weight:trend_close_above_ema20", "_weight:rsi_neutral_low", etc.

Return ONLY the raw JSON block. Do not include markdown code fence wrappers or backticks.
`;

    let responseText = await gemini.generateAnalysis(prompt);
    responseText = responseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    try {
      const parsed = JSON.parse(responseText);
      // Ensure alternativeMetrics exists
      if (!parsed.alternativeMetrics) {
        parsed.alternativeMetrics = {
          totalReturnPercent: afterMetrics.totalReturnPercent,
          winRatePercent: afterMetrics.winRatePercent,
          maxDrawdownPercent: afterMetrics.maxDrawdownPercent,
          totalTrades: afterMetrics.totalTrades,
        };
      }
      return parsed;
    } catch (err) {
      console.error("Failed to parse AI response as JSON:", responseText, err);
      // Fallback response format
      const fallbackParams: Record<string, { value: number; reason: string }> = {};
      Object.entries(afterParams).forEach(([k, v]) => {
        fallbackParams[k] = { value: v, reason: "Berdasarkan hasil pencarian optimal grid." };
      });
      return {
        alternativeParams: fallbackParams,
        alternativeMetrics: {
          totalReturnPercent: afterMetrics.totalReturnPercent,
          winRatePercent: afterMetrics.winRatePercent,
          maxDrawdownPercent: afterMetrics.maxDrawdownPercent,
          totalTrades: afterMetrics.totalTrades,
        }
      };
    }
  }
}
