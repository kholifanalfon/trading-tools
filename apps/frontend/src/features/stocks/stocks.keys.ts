export const stocksKeys = {
  all: ["stocks"] as const,
  lists: () => [...stocksKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...stocksKeys.lists(), { filters }] as const,
  details: () => [...stocksKeys.all, "detail"] as const,
  detail: (id: number) => [...stocksKeys.details(), id] as const,
};
