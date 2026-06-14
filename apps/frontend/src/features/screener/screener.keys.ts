export const screenerKeys = {
  all: ["screener"] as const,
  search: (query: string) => ["screener", "search", query] as const,
  quote: (symbol: string) => ["screener", "quote", symbol] as const,
};
