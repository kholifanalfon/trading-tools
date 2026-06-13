import { Router } from "express";
import { authRoutes } from "@/modules/auth/auth.routes";
import { userManagementRoutes } from "@/modules/user-management/user-management.routes";
import { stocksRoutes } from "@/modules/stocks/stocks.routes";
import { settingsRoutes } from "@/modules/settings/settings.routes";

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

// Sentry test endpoint
v1Router.get("/sentry-test", (req, res) => {
  throw new Error("Sentry Test Error from Express Backend!");
});

v1Router.use("/auth", authRoutes);
v1Router.use("/user-management", userManagementRoutes);
v1Router.use("/stocks", stocksRoutes);
v1Router.use("/settings", settingsRoutes);

export { v1Router };

