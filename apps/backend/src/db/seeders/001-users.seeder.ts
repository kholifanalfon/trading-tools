import { db } from "../db";
import { users } from "../schema";

export default async function seed() {
  console.log("🌱 Seeding data for: users...");
  
  const passwordHash1 = await Bun.password.hash("password123");
  const passwordHash2 = await Bun.password.hash("adminpwd456");

  await db.insert(users).values([
    {
      fullName: "John Doe",
      email: "john@example.com",
      userPassword: passwordHash1,
      role: "user",
      isActive: true,
    },
    {
      fullName: "Admin User",
      email: "admin@example.com",
      userPassword: passwordHash2,
      role: "admin",
      isActive: true,
    },
  ]).onConflictDoNothing();
  
  console.log("✅ Users seeded successfully!");
}
