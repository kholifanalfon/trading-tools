import { Request, Response, NextFunction } from "express";
import { logger } from "@/core/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Log incoming request details
  logger.info({
    requestId: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip || req.socket.remoteAddress,
  }, `Incoming Request: ${req.method} ${req.url}`);

  // Listen to request completion to log duration and response status
  res.on("finish", () => {
    const duration = Date.now() - start;
    
    // Use levels conditionally: warn on 4xx, error on 5xx, info otherwise
    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };
    const message = `Request Completed: ${req.method} ${req.url} ${res.statusCode} in ${duration}ms`;

    if (res.statusCode >= 500) {
      logger.error(logData, message);
    } else if (res.statusCode >= 400) {
      logger.warn(logData, message);
    } else {
      logger.info(logData, message);
    }
  });

  next();
}
