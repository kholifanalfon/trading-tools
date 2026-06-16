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
    {
      key: "screener_rules_day",
      value: '[{"field":"percentchange","operator":"gt","value":0},{"field":"dayvolume","operator":"gt","value":1000000},{"field":"regularmarketprice","operator":"gt","value":100}]',
    },
    {
      key: "screener_rules_swing",
      value: '[{"field":"dayvolume","operator":"gt","value":500000},{"field":"intradaymarketcap","operator":"gt","value":1000000000000},{"field":"percentchange","operator":"gt","value":0}]',
    },
    {
      key: "screener_rules_position",
      value: '[{"field":"forwardpe","operator":"btwn","value":5,"valueMax":25},{"field":"returnonequity","operator":"gt","value":15},{"field":"averagevolume","operator":"gt","value":2000000}]',
    },
  ]).onConflictDoNothing();
  
  console.log("✅ Settings seeded successfully!");
}

