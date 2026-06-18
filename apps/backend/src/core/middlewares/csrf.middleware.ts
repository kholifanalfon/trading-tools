import { Request, Response, NextFunction } from "express";
import { doubleCsrf } from "csrf-csrf";
import { config } from "@/core/config";

const isProduction = process.env.NODE_ENV === "production";

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => config.BE_JWT_SECRET,
  getSessionIdentifier: (req: Request) => {
    // Use the session JWT token cookie if present, otherwise empty string for anonymous users
    // Since the token cookie is signed, read from req.signedCookies
    return req.signedCookies?.token || req.cookies?.token || "";
  },
  cookieName: "XSRF-TOKEN",
  cookieOptions: {
    httpOnly: false, // Must be readable by Axios
    sameSite: config.BE_COOKIE_SAMESITE as any,
    secure: isProduction,
    domain: config.BE_COOKIE_DOMAIN || undefined,
    path: "/",
  },
  getCsrfTokenFromRequest: (req: Request) => req.headers["x-xsrf-token"] as string | null | undefined,
});

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    // Generate token and automatically set the XSRF-TOKEN cookie
    generateCsrfToken(req, res);
    return next();
  }

  // Use csrf-csrf's double submit validation for other methods (POST, PUT, DELETE, PATCH)
  return doubleCsrfProtection(req, res, next);
}
