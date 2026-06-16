export interface SettingsClientExchageSchema {
  id: string;
  name: string;
  suffix: string;
  enabled: boolean;
  limit: number;
  country: string;
  countryId: string;
}

export interface SettingsClientServiceSchema {
  getExchanges: () => Promise<SettingsClientExchageSchema[]>;
}
