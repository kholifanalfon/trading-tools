export const backtestKeys = {
  all: ["backtest"] as const,
  reports: () => [...backtestKeys.all, "reports"] as const,
};
