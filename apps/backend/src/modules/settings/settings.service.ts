import { SettingsRepository } from "./settings.repository";
import { UpdateSettingsInput } from "./settings.schema";
import { encrypt } from "@/core/utils/crypto";
import { ScoringRulesRepository } from "../screener/scoring-rules.repository";

export const API_KEY_MASK = "••••••••••••••••";

export const MASTER_EXCHANGES = [
  { id: "idx", name: "IDX / BEI", suffix: ".JK", enabled: true, limit: 15, country: "Indonesia", countryId: "ID" },
  { id: "nyse", name: "NYSE", suffix: "", enabled: true, limit: 15, country: "USA", countryId: "US" },
  { id: "nasdaq", name: "NASDAQ", suffix: "", enabled: true, limit: 15, country: "USA", countryId: "US" },
  { id: "sgx", name: "SGX", suffix: ".SI", enabled: false, limit: 15, country: "Singapore", countryId: "SG" },
  { id: "klse", name: "KLSE", suffix: ".KL", enabled: false, limit: 15, country: "Malaysia", countryId: "MY" },
  { id: "hkex", name: "HKEX", suffix: ".HK", enabled: false, limit: 15, country: "Hong Kong", countryId: "HK" },
  { id: "sse", name: "SSE", suffix: ".SS", enabled: false, limit: 15, country: "China (Shanghai)", countryId: "CN" },
  { id: "szse", name: "SZSE", suffix: ".SZ", enabled: false, limit: 15, country: "China (Shenzhen)", countryId: "CN" },
  { id: "lse", name: "LSE", suffix: ".L", enabled: false, limit: 15, country: "United Kingdom", countryId: "GB" },
  { id: "tyo", name: "TYO", suffix: ".T", enabled: false, limit: 15, country: "Japan", countryId: "JP" },
  { id: "asx", name: "ASX", suffix: ".AX", enabled: false, limit: 15, country: "Australia", countryId: "AU" },
  { id: "tsx", name: "TSX", suffix: ".TO", enabled: false, limit: 15, country: "Canada", countryId: "CA" },
  { id: "nse", name: "NSE", suffix: ".NS", enabled: false, limit: 15, country: "India", countryId: "IN" },
  { id: "bse", name: "BSE", suffix: ".BO", enabled: false, limit: 15, country: "India", countryId: "IN" },
];

export const DEFAULT_EXCHANGES = MASTER_EXCHANGES;

export class SettingsService {
  private repository = new SettingsRepository();

  async getSettings() {
    const list = await this.repository.getAllSettings();
    const configObj: Record<string, string> = {};
    for (const item of list) {
      configObj[item.key] = item.value;
    }

    // Mask the key if it exists and is not empty
    const hasGeminiKey = !!configObj.gemini_api_key;
    const hasFinnhubKey = !!configObj.finnhub_api_key;

    let exchangesConfig = DEFAULT_EXCHANGES;
    if (configObj.exchanges_config) {
      try {
        exchangesConfig = JSON.parse(configObj.exchanges_config);
      } catch (err) {
        console.error("Failed to parse exchanges_config:", err);
      }
    }

    return {
      gemini_api_key: hasGeminiKey ? API_KEY_MASK : "",
      gemini_model: configObj.gemini_model || "gemini-1.5-flash",
      finnhub_api_key: hasFinnhubKey ? API_KEY_MASK : "",
      stock_screener_provider: configObj.stock_screener_provider || "yahoo_finance",
      exchanges_config: JSON.stringify(exchangesConfig),
      default_strategy: configObj.default_strategy || "day",
      screener_rules_day: configObj.screener_rules_day || '[]',
      screener_rules_swing: configObj.screener_rules_swing || '[]',
      screener_rules_position: configObj.screener_rules_position || '[]',
    };
  }

  async updateSettings(data: UpdateSettingsInput) {
    if (data.gemini_api_key !== undefined) {
      // If the incoming key is not the mask, encrypt and save it
      if (data.gemini_api_key !== API_KEY_MASK) {
        const encryptedKey = encrypt(data.gemini_api_key);
        await this.repository.upsertSetting("gemini_api_key", encryptedKey);
      }
      // If it is the mask, we skip updating to prevent overwriting with the mask
    }
    if (data.gemini_model !== undefined) {
      await this.repository.upsertSetting("gemini_model", data.gemini_model);
    }
    if (data.finnhub_api_key !== undefined) {
      if (data.finnhub_api_key !== API_KEY_MASK) {
        const encryptedKey = encrypt(data.finnhub_api_key);
        await this.repository.upsertSetting("finnhub_api_key", encryptedKey);
      }
    }
    if (data.stock_screener_provider !== undefined) {
      await this.repository.upsertSetting("stock_screener_provider", data.stock_screener_provider);
    }
    if (data.exchanges_config !== undefined) {
      await this.repository.upsertSetting("exchanges_config", data.exchanges_config);
    }
    if (data.default_strategy !== undefined) {
      await this.repository.upsertSetting("default_strategy", data.default_strategy);
    }
    if (data.screener_rules_day !== undefined) {
      await this.repository.upsertSetting("screener_rules_day", data.screener_rules_day);
    }
    if (data.screener_rules_swing !== undefined) {
      await this.repository.upsertSetting("screener_rules_swing", data.screener_rules_swing);
    }
    if (data.screener_rules_position !== undefined) {
      await this.repository.upsertSetting("screener_rules_position", data.screener_rules_position);
    }
    return this.getSettings();
  }

  async syncExchanges() {
    const setting = await this.repository.getSettingByKey("exchanges_config");
    let currentExchanges: any[] = [];
    if (setting?.value) {
      try {
        currentExchanges = JSON.parse(setting.value);
      } catch (err) {
        console.error("Failed to parse current exchanges:", err);
      }
    }

    // Merge MASTER_EXCHANGES with existing user configurations
    const mergedExchanges = MASTER_EXCHANGES.map((master) => {
      const existing = currentExchanges.find((ex) => ex.id === master.id);
      if (existing) {
        return {
          ...master,
          enabled: existing.enabled, // preserve user choice
          limit: existing.limit !== undefined ? existing.limit : master.limit, // preserve user limit
        };
      }
      return master;
    });

    await this.repository.upsertSetting("exchanges_config", JSON.stringify(mergedExchanges));
    return this.getSettings();
  }

  private scoringRulesRepo = new ScoringRulesRepository();

  async getScoringRules() {
    return this.scoringRulesRepo.getAllRules();
  }

  async updateScoringRules(data: { rules: { id: number; value: number; weight: number }[] }) {
    const updated = [];
    for (const rule of data.rules) {
      const res = await this.scoringRulesRepo.updateRule(rule.id, rule.value, rule.weight);
      if (res) {
        updated.push(res);
      }
    }
    return updated;
  }

  async getAiScreenerRecommendation(strategy: "day" | "swing" | "position") {
    const list = await this.repository.getAllSettings();
    const configObj: Record<string, string> = {};
    for (const item of list) {
      configObj[item.key] = item.value;
    }

    const { decrypt } = await import("@/core/utils/crypto");
    const { GeminiAdapter } = await import("@/core/adapters/gemini.adapter");

    const encryptedKey = configObj.gemini_api_key;
    const apiKey = encryptedKey ? decrypt(encryptedKey) : "";
    const model = configObj.gemini_model || "gemini-1.5-flash";

    const gemini = new GeminiAdapter(apiKey, model);

    let isIndonesia = false;
    try {
      if (configObj.exchanges_config) {
        const exchanges = JSON.parse(configObj.exchanges_config);
        if (Array.isArray(exchanges)) {
          isIndonesia = exchanges.some(
            (ex: any) =>
              ex.enabled &&
              (ex.country?.toLowerCase() === "indonesia" ||
                ex.id?.toLowerCase() === "idx" ||
                ex.suffix?.toLowerCase() === ".jk")
          );
        }
      }
    } catch (e) {
      console.error("Failed to parse exchanges_config:", e);
    }

    const prompt = `
You are an expert financial analyst. Recommend stock screening rules (pre-filters) for a "${strategy}" trading strategy.
The target market/exchange region is: ${isIndonesia ? "Indonesia (IDX / Jakarta, currency in IDR)" : "United States (US, currency in USD)"}.

IMPORTANT REGIONAL GUIDELINES:
${
  isIndonesia
    ? `- The currency is Indonesian Rupiah (IDR).
- For "eodprice", prices are in IDR. A threshold of Rp 100 - Rp 1,000 is common. Do NOT recommend USD-scale prices like 50 or 100 unless you mean IDR Rp 50 or Rp 100 (Rp 50 is the absolute minimum price on IDX).
- For "intradaymarketcap", values are in IDR. Please note that 1 Billion USD is equivalent to ~15 Trillion IDR. A market cap of 1 Billion IDR (1 Miliar) is 1,000,000,000. Recommend values in the scale of Billions/Trillions IDR (e.g., 1,000,000,000 for 1 Miliar IDR, or 1,000,000,000,000 for 1 Trillion IDR).`
    : `- The currency is US Dollar (USD).
- E.g. price thresholds of $10 to $100 are common.
- Market cap is in USD (e.g., 1,000,000,000 for 1 Billion USD).`
}

The screener will query Yahoo Finance. Here are the ONLY supported operand field keys:
- "percentchange" (Daily Return %)
- "dayvolume" (Daily Volume in shares)
- "eodprice" (Price EOD)
- "intradaymarketcap" (Intraday Market Cap)
- "lastclose52weekhigh.lasttwelvemonths" (52-Week High)
- "lastclose52weeklow.lasttwelvemonths" (52-Week Low)
- "avgdailyvol3m" (Average Volume 3M)
- "beta" (Beta)
- "peratio.lasttwelvemonths" (Trailing P/E)
- "pricebookratio.quarterly" (Price to Book P/B)
- "pegratio_5y" (PEG Ratio 5Y)
- "bookvalueshare.lasttwelvemonths" (Book Value per Share)
- "lastclosetevebit.lasttwelvemonths" (EV to EBIT)
- "lastclosetevebitda.lasttwelvemonths" (EV to EBITDA)
- "returnonequity.lasttwelvemonths" (Return on Equity ROE %)
- "returnonassets.lasttwelvemonths" (Return on Assets ROA %)
- "ebitdamargin.lasttwelvemonths" (EBITDA Margin %)
- "grossprofitmargin.lasttwelvemonths" (Gross Profit Margin %)
- "netincomemargin.lasttwelvemonths" (Net Income Margin %)
- "epsgrowth.lasttwelvemonths" (EPS Growth %)
- "quarterlyrevenuegrowth.quarterly" (Quarterly Revenue Growth %)
- "totalrevenues1yrgrowth.lasttwelvemonths" (Revenue 1Y Growth %)
- "forward_dividend_yield" (Forward Dividend Yield %)
- "currentratio.lasttwelvemonths" (Current Ratio)
- "quickratio.lasttwelvemonths" (Quick Ratio)
- "totaldebtequity.lasttwelvemonths" (Debt to Equity Ratio)
- "ltdebtequity.lasttwelvemonths" (Long-term Debt to Equity)
- "ebitinterestexpense.lasttwelvemonths" (EBIT Interest Coverage)
- "ebitdainterestexpense.lasttwelvemonths" (EBITDA Interest Coverage)
- "netdebtebitda.lasttwelvemonths" (Net Debt to EBITDA)
- "totaldebtebitda.lasttwelvemonths" (Total Debt to EBITDA)
- "pctheldinsider" (Insider Ownership %)
- "pctheldinst" (Institutional Ownership %)
- "leveredfreecashflow.lasttwelvemonths" (Levered Free Cash Flow)
- "unleveredfreecashflow.lasttwelvemonths" (Unlevered Free Cash Flow)
- "capitalexpenditure.lasttwelvemonths" (Capital Expenditure)
- "cashfromoperations.lasttwelvemonths" (Cash from Operations CFO)
- "totalrevenues.lasttwelvemonths" (Total Revenue)
- "netincomeis.lasttwelvemonths" (Net Income)
- "ebitda.lasttwelvemonths" (EBITDA)
- "operatingincome.lasttwelvemonths" (Operating Income)
- "totalassets.lasttwelvemonths" (Total Assets)
- "totaldebt.lasttwelvemonths" (Total Debt)
- "totalequity.lasttwelvemonths" (Total Equity)
- "totalcurrentassets.lasttwelvemonths" (Total Current Assets)
- "totalcurrentliabilities.lasttwelvemonths" (Total Current Liabilities)
- "totalcommonsharesoutstanding.lasttwelvemonths" (Shares Outstanding)
- "short_percentage_of_shares_outstanding.value" (Short % of Shares Outstanding)
- "short_interest.value" (Short Interest)
- "short_percentage_of_float.value" (Short % of Float)
- "days_to_cover_short.value" (Days to Cover Short)
- "short_interest_percentage_change.value" (Short Interest % Change)
- "esg_score" (ESG Score)
- "environmental_score" (Environmental Score)
- "social_score" (Social Score)
- "governance_score" (Governance Score)
- "highest_controversy" (Highest Controversy Level)
- "altmanzscoreusingtheaveragestockinformationforaperiod.lasttwelvemonths" (Altman Z-Score)

Supported operators:
- "gt" (Greater Than)
- "lt" (Less Than)
- "eq" (Equal To)
- "btwn" (Between / Range)
- "gte" (Greater Than or Equal)
- "lte" (Less Than or Equal)

Please recommend a list of 3 to 6 optimized rules for "${strategy}" strategy.
For each rule, you must provide:
- "field" (string): one of the supported operands.
- "operator" (string): one of the supported operators.
- "value" (number): the threshold or min boundary value.
- "valueMax" (number, optional): max boundary value (required if operator is "btwn").
- "justification" (string): a brief explanation in Indonesian (max 15 words) of why this filter and value is recommended for "${strategy}" trading.

You must return your response in raw JSON format, containing exactly:
{
  "rules": [
    { "field": "percentchange", "operator": "gt", "value": 0, "justification": "Mencari momentum return positif hari ini." },
    ...
  ]
}

Return ONLY the raw JSON block. Do not include markdown code fence wrappers or backticks.
`;

    let responseText = await gemini.generateAnalysis(prompt);
    responseText = responseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    try {
      return JSON.parse(responseText);
    } catch (err) {
      console.error("Failed to parse Gemini recommendation:", responseText, err);
      if (strategy === "day") {
        return {
          rules: [
            { field: "percentchange", operator: "gt", value: 0, justification: "Mencari momentum return positif hari ini." },
            { field: "dayvolume", operator: "gt", value: 1000000, justification: "Menjamin likuiditas tinggi untuk intraday." },
            { field: "eodprice", operator: "gt", value: 100, justification: "Menghindari saham receh berisiko." }
          ]
        };
      } else if (strategy === "swing") {
        return {
          rules: [
            { field: "dayvolume", operator: "gt", value: 500000, justification: "Likuiditas memadai untuk hold beberapa hari." },
            { field: "intradaymarketcap", operator: "gt", value: 1000000000000, justification: "Memilih saham mid-to-large cap." },
            { field: "percentchange", operator: "gt", value: 0, justification: "Tren jangka pendek sedang naik." }
          ]
        };
      } else {
        return {
          rules: [
            { field: "peratio.lasttwelvemonths", operator: "btwn", value: 5, valueMax: 25, justification: "Valuasi wajar untuk investasi jangka panjang." },
            { field: "returnonequity.lasttwelvemonths", operator: "gt", value: 15, justification: "Efisiensi bisnis tinggi (ROE > 15%)." },
            { field: "avgdailyvol3m", operator: "gt", value: 2000000, justification: "Volume rata-rata sangat likuid." }
          ]
        };
      }
    }
  }

  async getAiScoringRulesRecommendation(strategy: "day" | "swing" | "position") {
    const list = await this.repository.getAllSettings();
    const configObj: Record<string, string> = {};
    for (const item of list) {
      configObj[item.key] = item.value;
    }

    const { decrypt } = await import("@/core/utils/crypto");
    const { GeminiAdapter } = await import("@/core/adapters/gemini.adapter");

    const encryptedKey = configObj.gemini_api_key;
    const apiKey = encryptedKey ? decrypt(encryptedKey) : "";
    const model = configObj.gemini_model || "gemini-1.5-flash";

    const gemini = new GeminiAdapter(apiKey, model);

    let isIndonesia = false;
    try {
      if (configObj.exchanges_config) {
        const exchanges = JSON.parse(configObj.exchanges_config);
        if (Array.isArray(exchanges)) {
          isIndonesia = exchanges.some(
            (ex: any) =>
              ex.enabled &&
              (ex.country?.toLowerCase() === "indonesia" ||
                ex.id?.toLowerCase() === "idx" ||
                ex.suffix?.toLowerCase() === ".jk")
          );
        }
      }
    } catch (e) {
      console.error("Failed to parse exchanges_config:", e);
    }

    const prompt = `
You are an expert financial analyst. Recommend scoring rule parameters and risk management thresholds for a "${strategy}" trading strategy.
The target market/exchange region is: ${isIndonesia ? "Indonesia (IDX / Jakarta, currency in IDR)" : "United States (US, currency in USD)"}.

Here are the specific parameters we need recommendations for:
\${
  strategy === "day"
    ? \`- "rvol_high_threshold", "rvol_medium_threshold", "rvol_low_threshold" (Relative Volume thresholds)
- "atr_high_threshold", "atr_medium_threshold" (ATR thresholds in % of stock price)
- "gap_high_threshold", "gap_medium_threshold" (Opening gap % thresholds)
- "rsi_overbought", "rsi_oversold" (RSI boundaries)
- "liquidity_high", "liquidity_medium" (Daily volume in shares)
- "bb_lower_bounce" (Bollinger band bounce flag, usually 0.0 or 1.0)
- "price_above_vwap" (Price above VWAP flag, usually 0.0 or 1.0)
- "zscore_extreme_reversal" (Z-Score threshold)
- "ad_line_uptrend" (A/D line flag, usually 0.0 or 1.0)
- "fallback_atr_percent" (Fallback ATR percentage, e.g. 0.01 for 1%)
- "sl_multiplier" (Stop Loss ATR multiplier, e.g. 1.0)
- "tp_multiplier" (Target Profit ATR multiplier, e.g. 2.0)
- "min_reward_risk_ratio" (Minimum Reward to Risk Ratio, e.g. 1.5)\`
    : strategy === "swing"
    ? \`- "trend_close_above_ema20", "trend_ema20_above_ema50" (Trend flags, usually 0.0 or 1.0)
- "macd_hist_positive", "macd_line_above_signal", "macd_golden_cross" (MACD indicators, usually 0.0 or 1.0)
- "rsi_neutral_low", "rsi_neutral_high", "rsi_neutral_exit" (RSI boundaries)
- "volume_above_average" (Volume above average flag, usually 0.0 or 1.0)
- "proximity_ema20_percent" (Proximity to EMA20 as decimal fraction, e.g. 0.02)
- "adx_strong_trend" (ADX threshold, e.g. 25.0)
- "vwap_deviation_exhaustion" (VWAP standard deviation threshold, e.g. 2.0)
- "fallback_atr_percent" (Fallback ATR percentage, e.g. 0.02 for 2%)
- "sl_multiplier" (Stop Loss ATR multiplier, e.g. 2.0)
- "tp_multiplier" (Target Profit ATR multiplier, e.g. 6.0)
- "min_reward_risk_ratio" (Minimum Reward to Risk Ratio, e.g. 2.0)\`
    : \`- "trend_close_above_sma200", "trend_sma50_above_sma200" (Trend flags, usually 0.0 or 1.0)
- "strength_52w_high_diff" (52-week high difference as decimal fraction, e.g. 0.1)
- "momentum_1y_high", "momentum_1y_medium" (1-year return % thresholds)
- "volatility_atr_low", "volatility_atr_medium" (ATR thresholds in % of stock price)
- "poc_pullback_proximity" (Proximity to Point of Control, e.g. 0.05)
- "rvol_breakout_confirm" (Relative Volume breakout threshold, e.g. 1.5)
- "fallback_atr_percent" (Fallback ATR percentage, e.g. 0.05 for 5%)
- "sl_multiplier" (Stop Loss ATR multiplier, e.g. 3.0)
- "tp_multiplier" (Target Profit ATR multiplier, e.g. 15.0)
- "min_reward_risk_ratio" (Minimum Reward to Risk Ratio, e.g. 5.0)\`
}

Please recommend a list of optimized parameter values.
For each parameter, you must provide:
- "parameterName" (string): the exact name of the parameter listed above.
- "value" (number): the recommended value.
- "justification" (string): a brief explanation in Indonesian (max 15 words) of why this value is recommended.

You must return your response in raw JSON format, containing exactly:
{
  "recommendations": [
    { "parameterName": "sl_multiplier", "value": 1.0, "justification": "Menghindari stop loss terlalu lebar untuk trading harian." },
    ...
  ]
}

Return ONLY the raw JSON block. Do not include markdown code fence wrappers or backticks.
`;

    let responseText = await gemini.generateAnalysis(prompt);
    responseText = responseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    try {
      return JSON.parse(responseText);
    } catch (err) {
      console.error("Failed to parse Gemini scoring rules recommendation:", responseText, err);
      // Return defaults based on strategy
      if (strategy === "day") {
        return {
          recommendations: [
            { parameterName: "fallback_atr_percent", value: 0.01, justification: "Volatilitas standar 1% untuk day trading." },
            { parameterName: "sl_multiplier", value: 1.0, justification: "Stop Loss ketat berbasis 1.0x ATR." },
            { parameterName: "tp_multiplier", value: 2.0, justification: "Target Profit realistis 2.0x ATR." },
            { parameterName: "min_reward_risk_ratio", value: 1.5, justification: "Rasio RR minimal 1.5x." }
          ]
        };
      } else if (strategy === "swing") {
        return {
          recommendations: [
            { parameterName: "fallback_atr_percent", value: 0.02, justification: "Volatilitas standar 2% untuk swing trading." },
            { parameterName: "sl_multiplier", value: 2.0, justification: "Stop Loss moderat berbasis 2.0x ATR." },
            { parameterName: "tp_multiplier", value: 6.0, justification: "Target Profit lebar 6.0x ATR." },
            { parameterName: "min_reward_risk_ratio", value: 2.0, justification: "Rasio RR minimal 2.0x." }
          ]
        };
      } else {
        return {
          recommendations: [
            { parameterName: "fallback_atr_percent", value: 0.05, justification: "Volatilitas standar 5% untuk position trading." },
            { parameterName: "sl_multiplier", value: 3.0, justification: "Stop Loss longgar berbasis 3.0x ATR." },
            { parameterName: "tp_multiplier", value: 15.0, justification: "Target Profit investasi jangka panjang 15.0x ATR." },
            { parameterName: "min_reward_risk_ratio", value: 5.0, justification: "Rasio RR minimal 5.0x." }
          ]
        };
      }
    }
  }
}

