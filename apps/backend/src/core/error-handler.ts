import { Request, Response, NextFunction } from "express";
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

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
}
