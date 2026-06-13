import { Request, Response, NextFunction } from "express";

export function navigationBlocker(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const secFetchMode = req.headers["sec-fetch-mode"];
  const secFetchDest = req.headers["sec-fetch-dest"];

  // Block direct browser navigation access (e.g. user opening the link directly in address bar)
  if (secFetchMode === "navigate" || secFetchDest === "document") {
    return res.status(403).json({
      error: "Direct browser access is not allowed",
    });
  }

  next();
}
