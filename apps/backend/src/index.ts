import express from "express";
import * as Sentry from "@sentry/node";
import helmet from "helmet";
import { webSocketService } from "./core/websocket";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import { config } from "./core/config";
import { logger } from "./core/logger";
import { errorHandler } from "./core/error-handler";
import { v1Router } from "@/routes/v1.router";
import { generalLimiter } from "./core/middlewares/rate-limiter.middleware";
import { xssClean } from "./core/middlewares/xss-clean.middleware";
import { csrfProtection } from "@/core/middlewares/csrf.middleware";
import { corsMiddleware } from "@/core/middlewares/cors.middleware";
import { navigationBlocker } from "@/core/middlewares/navigation-blocker.middleware";
import { requestIdMiddleware } from "@/core/middlewares/request-id.middleware";
import { requestLogger } from "@/core/middlewares/request-logger.middleware";

import "@/core/utils/string-extensions";

// Initialize Sentry first to capture all activity
if (config.BE_SENTRY_DSN) {
  Sentry.init({
    dsn: config.BE_SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

const app = express();

// Disable X-Powered-By header
app.disable("x-powered-by");

// Set up unique Request IDs and Request Logging
app.use(requestIdMiddleware);
app.use(requestLogger);

// Enable CORS with Credentials support
app.use(corsMiddleware);

// Set secure HTTP headers
app.use(helmet());

// Apply global rate limiting
app.use(generalLimiter);

// Block direct browser navigation access globally
app.use(navigationBlocker);

// Limit JSON payload body size to 10kb
app.use(express.json({ limit: "10kb" }));

// Limit URL-Encoded payload body size to 10kb
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Prevent HTTP Parameter Pollution attacks
app.use(hpp());

// Sanitize request inputs from XSS scripts
app.use(xssClean);

// Parse request cookies
app.use(cookieParser(config.BE_JWT_SECRET));

// Enable CSRF protection
// app.use(csrfProtection);

// Register routes
app.use("/api/v1", v1Router);

import { initializeDatabase } from "@/core/startup";

// Basic health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

const server = app.listen(config.BE_PORT, async () => {
  logger.info(`🚀 Backend server is running on http://localhost:${config.BE_PORT}`);
  await initializeDatabase();
});

// Initialize WebSocket Service on the HTTP server
webSocketService.initialize(server);
