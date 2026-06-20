export const portfolioKeys = {
  all: ["portfolios"] as const,
  lists: () => [...portfolioKeys.all, "list"] as const,
  details: () => [...portfolioKeys.all, "detail"] as const,
  detail: (id: number) => [...portfolioKeys.details(), id] as const,
};
