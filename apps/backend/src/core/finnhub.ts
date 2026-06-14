import * as finnhub from "finnhub";

export function getFinnhubClient(apiKey: string) {
  const apiClient = (finnhub as any).ApiClient.instance;
  const api_key = apiClient.authentications["api_key"];
  api_key.apiKey = apiKey;
  return new (finnhub as any).DefaultApi();
}
