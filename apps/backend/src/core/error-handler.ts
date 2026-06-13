import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import * as Sentry from "@sentry/node";
import { logger } from "./logger";
import { config } from "./config";
import { AppError } from "@/core/errors/app-error";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";
  let details: any = undefined;
  let errorType: "application" | "server" = "server";
  let errorCode = "INTERNAL_SERVER_ERROR";

  // 1. Classify error type (application vs server)
  if (err instanceof ZodError) {
    status = 400;
    errorType = "application";
    errorCode = "VALIDATION_ERROR";
    message = "Validation Error";
    details = err.errors;
  } else if (err instanceof AppError) {
    status = err.status;
    errorType = "application";
    // Convert class name to UPPER_SNAKE_CASE (e.g. UnauthorizedError -> UNAUTHORIZED)
    errorCode = err.name
      .replace(/Error$/, "")
      .replace(/([A-Z])/g, "_$1")
      .toUpperCase()
      .replace(/^_/, "");
  } else {
    errorType = "server";
    errorCode = "INTERNAL_SERVER_ERROR";
  }

  // 2. Capture Server Errors to Sentry (or all unexpected errors)
  if (errorType === "server" && config.BE_SENTRY_DSN) {
    Sentry.withScope((scope) => {
      scope.setTag("trace_id", req.id);
      scope.setExtra("path", req.path);
      scope.setExtra("method", req.method);
      if (req.ip) scope.setExtra("ip", req.ip);
      Sentry.captureException(err);
    });
  }

  // 3. Log the error details in console
  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        ...err,
      },
      requestId: req.id,
      errorType,
      path: req.path,
      method: req.method,
    },
    `An error occurred: ${message}`
  );

  const isProduction = process.env.NODE_ENV === "production";

  // Strip technical details from 500 errors in production
  if (isProduction && errorType === "server") {
    message = "Internal Server Error";
  }

  // 4. Construct standard error response envelope
  res.status(status).json({
    type: errorType,
    status,
    code: errorCode,
    message,
    ...(details ? { details } : {}),
    // Include requestId specifically for server-side errors to aid developer tracing
    ...(errorType === "server" && req.id ? { requestId: req.id } : {}),
    // Include stack trace only in development environment
    ...(!isProduction && err.stack ? { stack: err.stack } : {}),
  });
}
