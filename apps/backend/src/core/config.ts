import { z } from "zod";
import * as dotenv from "dotenv";
import { resolve } from "node:path";

// Load root .env
dotenv.config({ path: resolve(__dirname, "../../../../.env") });

const envSchema = z.object({
  BE_PORT: z.coerce.number().default(3000),
  BE_DATABASE_URL: z.string().url(),
  BE_JWT_SECRET: z.string().min(32),
  BE_LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  BE_CORS_ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:8082,http://127.0.0.1:8082,http://localhost:5173,http://127.0.0.1:5173")
    .transform((val) => val.split(",").map((origin) => origin.trim())),
  BE_SENTRY_DSN: z.string().url().optional().or(z.literal("")),
  BE_TRUST_PROXY: z
    .string()
    .default("1")
    .transform((val) => {
      if (val.toLowerCase() === "true") return true;
      if (val.toLowerCase() === "false") return false;
      const num = Number(val);
      if (!isNaN(num)) return num;
      return val;
    }),
  BE_COOKIE_DOMAIN: z.string().optional().or(z.literal("")),
  BE_COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
export type EnvConfig = z.infer<typeof envSchema>;
