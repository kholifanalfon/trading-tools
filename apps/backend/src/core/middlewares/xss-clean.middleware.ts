import { Request, Response, NextFunction } from "express";
import sanitizeHtml from "sanitize-html";

function cleanValue(val: any): any {
  if (typeof val === "string") {
    // Strip all HTML tags and attributes for general text inputs using a robust DOM parser
    return sanitizeHtml(val, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
  }

  if (typeof val === "object" && val !== null) {
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        val[key] = cleanValue(val[key]);
      }
    }
  }

  return val;
}

export function xssClean(req: Request, res: Response, next: NextFunction) {
  if (req.body) req.body = cleanValue(req.body);
  if (req.query) req.query = cleanValue(req.query);
  if (req.params) req.params = cleanValue(req.params);
  next();
}
