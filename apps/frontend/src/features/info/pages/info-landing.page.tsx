import { useGetInfo } from "../hooks/use-get-info";
import { InfoPresenter } from "../components/info-presenter";
import { triggerBackendSentryTest } from "../services/info.api";
import { useGetPortfolios } from "../../portfolio/hooks/use-get-portfolios";
import { useGetJournals } from "../../journal/hooks/use-get-journals";
import { useGetLiveStockData } from "../../live-screener/hooks/use-get-live-stock-data";
import { useGetAllHoldings } from "../../portfolio/hooks/use-get-all-holdings";

import * as Sentry from "@sentry/react";

export function InfoLandingPage() {
  const { data: backendStack, isLoading: isInfoLoading, error: infoError } = useGetInfo();
  const { data: portfolios, isLoading: isPortfoliosLoading, error: portfoliosError } = useGetPortfolios();
  const { data: journals, isLoading: isJournalsLoading, error: journalsError } = useGetJournals();
  const { data: liveScreenerData, isLoading: isScreenerLoading, error: screenerError } = useGetLiveStockData({
    page: 1,
    limit: 5,
    strategy: "day",
  });
  const { data: holdings, isLoading: isHoldingsLoading, error: holdingsError } = useGetAllHoldings();

  const frontendStack = [
    {
      name: "React 18",
      desc: "UI Library with component-driven architecture",
      type: "Core",
    },
    {
      name: "TypeScript",
      desc: "Statically typed programming language",
      type: "Language",
    },
    {
      name: "Vite",
      desc: "Ultra-fast frontend build tool",
      type: "Build Tool",
    },
    {
      name: "Tailwind CSS",
      desc: "Utility-first CSS styling framework",
      type: "Styling",
    },
    {
      name: "Zustand",
      desc: "Lightweight state management store",
      type: "State",
    },
    {
      name: "TanStack Query",
      desc: "Powerful caching & server state manager",
      type: "Data fetching",
    },
    {
      name: "React Hook Form",
      desc: "Performant form state & validation handlers",
      type: "Forms",
    },
    {
      name: "Zod",
      desc: "Schema validation & TS type inference",
      type: "Validation",
    },
  ];

  const handleTestFrontendSentry = () => {
    // Deliberately throw an error to let Sentry capture it
    throw new Error("Sentry Test Error from React Frontend!");
  };

  const handleTestBackendSentry = async () => {
    try {
      await triggerBackendSentryTest();
    } catch (err) {
      console.log("Expected test error triggered on backend:", err);
      // Manually capture the error to Sentry, which will show it centrally via beforeSend
      Sentry.captureException(err);
    }
  };

  const isLoading = isInfoLoading || isPortfoliosLoading || isJournalsLoading || isScreenerLoading || isHoldingsLoading;
  const error = infoError || portfoliosError || journalsError || screenerError || holdingsError;

  return (
    <InfoPresenter
      backendStack={backendStack}
      isLoading={isLoading}
      error={error}
      frontendStack={frontendStack}
      onTestFrontendSentry={handleTestFrontendSentry}
      onTestBackendSentry={handleTestBackendSentry}
      portfolios={portfolios}
      journals={journals}
      topStocks={liveScreenerData?.items || []}
      holdings={holdings}
    />
  );
}

