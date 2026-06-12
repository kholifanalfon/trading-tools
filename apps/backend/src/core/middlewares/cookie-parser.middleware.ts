import { Request, Response, NextFunction } from "express";

export function cookieParser(req: Request, res: Response, next: NextFunction) {
  const cookieHeader = req.headers.cookie;
  (req as any).cookies = {};
  
  if (cookieHeader) {
    const cookies = cookieHeader.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name && value) {
        (req as any).cookies[name] = decodeURIComponent(value);
      }
    }
  }
  
  next();
}
