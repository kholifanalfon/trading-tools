import YahooFinance from "yahoo-finance2";

export const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
  queue: {
    concurrency: 2,
    interval: 500,
  },
  fetchOptions: {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  },
});
