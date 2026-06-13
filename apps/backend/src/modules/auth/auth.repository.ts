import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { RegisterInput } from "./auth.schema";

export class AuthRepository {
  async getUserByEmail(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] || null;
  }

  async createUser(data: RegisterInput) {
    const result = await db
      .insert(users)
      .values({
        fullName: data.name,
        email: data.email,
        userPassword: data.password,
      })
      .returning();
    return result[0];
  }
}
