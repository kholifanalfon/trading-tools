import { UserManagementRepository } from "./user-management.repository";
import {
  CreateUserInput,
  UpdateUserInput,
  UserQueryInput,
} from "./user-management.schema";
import { DataNotFoundError } from "@/core/errors/data-not-found-error";
import { DataExistError } from "@/core/errors/data-exist-error";

export class UserManagementService {
  private repository = new UserManagementRepository();

  async getUsers(query: UserQueryInput) {
    return this.repository.getUsers(query);
  }

  async getUserById(id: number) {
    const user = await this.repository.getUserById(id);
    if (!user) {
      throw new DataNotFoundError("User not found");
    }
    return user;
  }

  async createUser(data: CreateUserInput) {
    const existingUser = await this.repository.getUserByEmail(data.email);
    if (existingUser) {
      throw new DataExistError("Email is already registered");
    }

    const hashedPassword = await Bun.password.hash(data.password);
    return this.repository.createUser({
      ...data,
      password: hashedPassword,
    });
  }

  async updateUser(id: number, data: UpdateUserInput) {
    const existingUser = await this.repository.getUserById(id);
    if (!existingUser) {
      throw new DataNotFoundError("User not found");
    }

    if (data.email) {
      const emailUser = await this.repository.getUserByEmail(data.email);
      if (emailUser && emailUser.id !== id) {
        throw new DataExistError("Email is already registered by another user");
      }
    }

    return this.repository.updateUser(id, data);
  }

  async deleteUser(id: number) {
    const existingUser = await this.repository.getUserById(id);
    if (!existingUser) {
      throw new DataNotFoundError("User not found");
    }

    return this.repository.deleteUser(id);
  }
}
