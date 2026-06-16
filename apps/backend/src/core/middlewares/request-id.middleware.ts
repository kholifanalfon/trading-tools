import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // Use existing header if forwarded from gateway, otherwise generate new UUID
  const requestId = (req.headers["x-request-id"] as string) || crypto.randomUUID();

  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);

  next();
}
