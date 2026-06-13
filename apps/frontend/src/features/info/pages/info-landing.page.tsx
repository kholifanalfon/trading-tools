import { useGetInfo } from "../hooks/use-get-info";
import { InfoPresenter } from "../components/info-presenter";
import { triggerBackendSentryTest } from "../services/info.api";

import * as Sentry from "@sentry/react";

export function InfoLandingPage() {
  const { data: backendStack, isLoading, error } = useGetInfo();

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

  return (
    <InfoPresenter
      backendStack={backendStack}
      isLoading={isLoading}
      error={error}
      frontendStack={frontendStack}
      onTestFrontendSentry={handleTestFrontendSentry}
      onTestBackendSentry={handleTestBackendSentry}
    />
  );
}
