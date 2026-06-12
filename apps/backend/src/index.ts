import express from "express";
import { config } from "./core/config";
import { logger } from "./core/logger";
import { errorHandler } from "./core/error-handler";
import { cookieParser } from "./core/middlewares/cookie-parser.middleware";
import { authRoutes } from "./modules/auth/auth.routes";

const app = express();

app.use(express.json());
app.use(cookieParser);

// Enable CORS with Credentials support
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow local development ports
  if (
    origin === "http://localhost:8082" ||
    origin === "http://127.0.0.1:8082" ||
    origin === "http://localhost:5173" ||
    origin === "http://127.0.0.1:5173"
  ) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Register routes
app.use("/api/v1/auth", authRoutes);

// Basic health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Info route returning tech stack details
app.get("/info", (req, res) => {
  res.json({
    runtime: "Bun",
    framework: "Express",
    orm: "Drizzle ORM",
    database: "PostgreSQL (PgBouncer - Transaction Mode)",
    logger: "Pino",
    validation: "Zod",
    auth: "Jose (JWT)"
  });
});

// Global Error Handler
app.use(errorHandler);

app.listen(config.BE_PORT, () => {
  logger.info(`🚀 Backend server is running on http://localhost:${config.BE_PORT}`);
});
