import { Request, Response, NextFunction } from "express";
import { config } from "@/core/config";

export function navigationBlocker(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const secFetchMode = req.headers["sec-fetch-mode"];
  const secFetchDest = req.headers["sec-fetch-dest"];

  // Block direct browser navigation access and redirect to the frontend origin
  if (secFetchMode === "navigate" || secFetchDest === "document") {
    const frontendUrl = config.BE_CORS_ALLOWED_ORIGINS[0] || "http://localhost:8082";
    return res.redirect(302, frontendUrl);
  }

  next();
}
