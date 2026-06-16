import { Request, Response, NextFunction } from "express";
import { logger } from "@/core/logger";

function sanitizeLogValue(val: string): string {
  return val.replace(/[\r\n]/g, "_");
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const cleanMethod = sanitizeLogValue(req.method || "");
  const cleanUrl = sanitizeLogValue(req.url || "");

  // Log incoming request details
  logger.info(
    {
      requestId: req.id,
      method: cleanMethod,
      url: cleanUrl,
      ip: req.ip || req.socket.remoteAddress,
    },
    `[INFO] Incoming Request: ${cleanMethod.removeNewline()} ${cleanUrl.removeNewline()}`,
  );

  // Listen to request completion to log duration and response status
  res.on("finish", () => {
    const duration = Date.now() - start;

    // Use levels conditionally: warn on 4xx, error on 5xx, info otherwise
    const logData = {
      requestId: req.id,
      method: cleanMethod,
      url: cleanUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };
    const message = `[INFO] Request Completed: ${cleanMethod.removeNewline()} ${cleanUrl.removeNewline()} ${res.statusCode} in ${duration}ms`;

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
