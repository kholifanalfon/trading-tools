export const journalKeys = {
  all: ["trading-journals"] as const,
  lists: () => [...journalKeys.all, "list"] as const,
  details: () => [...journalKeys.all, "detail"] as const,
  detail: (id: number) => [...journalKeys.details(), id] as const,
};
