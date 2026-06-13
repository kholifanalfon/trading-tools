import { db } from "@/db/db";
import { settings } from "@/db/schema";

export default async function seed() {
  console.log("🌱 Seeding data for: settings...");
  
  await db.insert(settings).values([
    {
      key: "gemini_api_key",
      value: "",
    },
    {
      key: "gemini_model",
      value: "gemini-1.5-flash",
    },
  ]).onConflictDoNothing();
  
  console.log("✅ Settings seeded successfully!");
}

