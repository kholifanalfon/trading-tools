import { SettingsRepository } from "./settings.repository";
import { SettingsClientExchageSchema, SettingsClientServiceSchema } from "./settings-client.types";

export class SettingsClientService implements SettingsClientServiceSchema {
  private repository = new SettingsRepository();

  async getExchanges(): Promise<SettingsClientExchageSchema[]> {
    try {
      const exchanges = await this.repository.getSettingByKey("exchanges_config");
      if (!exchanges) {
        throw new Error("Exchanges config not found");
      }
      const parsedExchanges = JSON.parse(exchanges.value);
      return parsedExchanges
        .filter((exchange: SettingsClientExchageSchema) => exchange.enabled)
        .map((exchange: SettingsClientExchageSchema) => ({
          id: exchange.id,
          name: exchange.name,
          suffix: exchange.suffix,
          countryId: exchange.countryId,
          country: exchange.country,
        }));
    } catch (error) {
      console.error("Error fetching exchanges:", error);
      throw error;
    }
  }
}
