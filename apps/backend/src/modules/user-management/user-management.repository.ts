import { eq, like, or, sql, desc } from "drizzle-orm";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { CreateUserInput, UpdateUserInput, UserQueryInput } from "./user-management.schema";

export class UserManagementRepository {
  async getUsers(query: UserQueryInput) {
    const offset = (query.page - 1) * query.limit;

    // Build filter condition
    const searchFilter = query.search ? or(like(users.fullName, `%${query.search}%`), like(users.email, `%${query.search}%`)) : undefined;

    // Fetch user items
    const items = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(searchFilter)
      .limit(query.limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));

    // Fetch total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(searchFilter);
    const total = Number(totalResult[0]?.count || 0);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async getUserById(id: number) {
    const result = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] || null;
  }

  async getUserByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  async createUser(data: CreateUserInput & { password: string }) {
    const result = await db
      .insert(users)
      .values({
        fullName: data.name,
        email: data.email,
        userPassword: data.password,
        role: data.role,
      })
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });
    return result[0];
  }

  async updateUser(id: number, data: UpdateUserInput) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.fullName = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    updateData.updatedAt = new Date();

    const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });
    return result[0] || null;
  }

  async deleteUser(id: number) {
    const result = await db.delete(users).where(eq(users.id, id)).returning({
      id: users.id,
    });
    return result[0] || null;
  }
}
