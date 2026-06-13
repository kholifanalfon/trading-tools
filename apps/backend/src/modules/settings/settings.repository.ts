import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { settings } from "@/db/schema";

export class SettingsRepository {
  async getAllSettings() {
    return db.select().from(settings);
  }

  async getSettingByKey(key: string) {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    return result[0] || null;
  }

  async upsertSetting(key: string, value: string) {
    const result = await db
      .insert(settings)
      .values({
        key,
        value,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: {
          value,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }
}
