import { Router } from "express";
import { authRoutes } from "@/modules/auth/auth.routes";

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

v1Router.use("/auth", authRoutes);

export { v1Router };
