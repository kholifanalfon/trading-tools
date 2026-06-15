import { SettingsRepository } from "./settings.repository";
import { UpdateSettingsInput } from "./settings.schema";
import { encrypt } from "@/core/utils/crypto";

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
}
