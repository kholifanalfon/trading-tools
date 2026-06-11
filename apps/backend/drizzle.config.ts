import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import { resolve } from "node:path";

// Load root .env file
dotenv.config({ path: resolve(__dirname, "../../.env") });

const dbUrl = process.env.BE_DATABASE_URL;
if (!dbUrl) {
  throw new Error("BE_DATABASE_URL is not set inside the root .env file");
}

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: dbUrl,
  },
} satisfies Config;
