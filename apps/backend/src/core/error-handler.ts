import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "./logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        ...err,
      },
      path: req.path,
      method: req.method,
    },
    "An error occurred in backend request chain"
  );

  let status = err.status || 500;
  let message = err.message || "Internal Server Error";
  let details: any = undefined;

  // Handle Zod validation errors with HTTP 400
  if (err instanceof ZodError) {
    status = 400;
    message = "Validation Error";
    details = err.errors;
  }

  res.status(status).json({
    error: {
      message,
      status,
      ...(details ? { details } : {}),
    },
  });
}
