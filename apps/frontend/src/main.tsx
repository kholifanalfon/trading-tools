import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./index.css";
import App from "./App.tsx";

import { useErrorStore } from "@/shared/stores/error.store";

const sentryDsn = import.meta.env.FE_VITE_SENTRY_DSN;

const generateUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "f" + Math.random().toString(36).substring(2, 15) + "-" + Math.random().toString(36).substring(2, 15);
};

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.0,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 0.0,
    beforeSend(event, hint) {
      // Create tags object if it doesn't exist
      event.tags = event.tags || {};
      
      // If the event doesn't already have a trace_id tag, generate one
      if (!event.tags.trace_id) {
        event.tags.trace_id = generateUUID();
      }
      
      // Attach the trace_id back to the original exception object
      const originalException = hint?.originalException;
      let errorObj = originalException;
      if (originalException && typeof originalException === "object") {
        (originalException as any).traceId = event.tags.trace_id;
      } else {
        errorObj = new Error(event.message || "An error occurred");
        (errorObj as any).traceId = event.tags.trace_id;
      }
      
      // Trigger centralized error store to show this error!
      useErrorStore.getState().setError(errorObj);
      
      return event;
    },
  });
}

import { initCsrf } from "@/shared/config/api";

const renderApp = () => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

// Fetch CSRF token first, then render the application
initCsrf()
  .then(renderApp)
  .catch((err) => {
    console.error("Initialization error (CSRF):", err);
    // Fallback to rendering the app anyway so users get friendly error state instead of blank screen
    renderApp();
  });
