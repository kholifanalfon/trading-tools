import express from "express";
import { config } from "./core/config";
import { logger } from "./core/logger";
import { errorHandler } from "./core/error-handler";

const app = express();

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

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
