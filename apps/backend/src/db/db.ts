import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "@/core/config";
import * as schema from "./schema";

const queryClient = postgres(config.BE_DATABASE_URL);
export const db = drizzle(queryClient, { schema });
