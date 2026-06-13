import cors from "cors";
import { config } from "@/core/config";

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin || config.BE_CORS_ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cookie",
    "X-XSRF-TOKEN",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});
