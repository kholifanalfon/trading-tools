import { Router } from "express";
import { authRoutes } from "@/modules/auth/auth.routes";
import { userManagementRoutes } from "@/modules/user-management/user-management.routes";
import { stocksRoutes } from "@/modules/stocks/stocks.routes";
import { settingsRoutes } from "@/modules/settings/settings.routes";
import { screenerRoutes } from "@/modules/screener/screener.routes";
import { liveScreenerRoutes } from "@/modules/live-screener/live-screener.routes";
import { backtestRoutes } from "@/modules/backtest/backtest.routes";
import { generateCsrfToken } from "@/core/middlewares/csrf.middleware";

const v1Router = Router();


// Info route returning tech stack details
v1Router.get("/", (req, res) => {
  res.json({
    runtime: "Bun",
    framework: "Express",
    orm: "Drizzle ORM",
    database: "PostgreSQL (PgBouncer - Transaction Mode)",
    logger: "Pino",
    validation: "Zod",
    auth: "Jose (JWT)",
    version: "v1.0.0",
  });
});

// CSRF token endpoint
v1Router.get("/csrf-token", (req, res) => {
  const token = generateCsrfToken(req, res);
  res.json({ csrfToken: token });
});

// Sentry test endpoint
v1Router.get("/sentry-test", (req, res) => {
  throw new Error("Sentry Test Error from Express Backend!");
});

v1Router.use("/auth", authRoutes);
v1Router.use("/user-management", userManagementRoutes);
v1Router.use("/stocks", stocksRoutes);
v1Router.use("/settings", settingsRoutes);
v1Router.use("/screener", screenerRoutes);
v1Router.use("/live-screener", liveScreenerRoutes);
v1Router.use("/backtest", backtestRoutes);

export { v1Router };
