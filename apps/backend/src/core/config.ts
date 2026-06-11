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
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
export type EnvConfig = z.infer<typeof envSchema>;
