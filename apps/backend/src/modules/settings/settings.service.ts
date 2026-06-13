import { SettingsRepository } from "./settings.repository";
import { UpdateSettingsInput } from "./settings.schema";
import { encrypt } from "@/core/utils/crypto";

export const API_KEY_MASK = "••••••••••••••••";

export class SettingsService {
  private repository = new SettingsRepository();

  async getSettings() {
    const list = await this.repository.getAllSettings();
    const configObj: Record<string, string> = {};
    for (const item of list) {
      configObj[item.key] = item.value;
    }

    // Mask the key if it exists and is not empty
    const hasKey = !!configObj.gemini_api_key;
    return {
      gemini_api_key: hasKey ? API_KEY_MASK : "",
      gemini_model: configObj.gemini_model || "gemini-1.5-flash",
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
    return this.getSettings();
  }
}

