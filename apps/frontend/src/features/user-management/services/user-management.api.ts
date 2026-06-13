import { api } from "@/shared/config/api";
import { CreateUserPayload, UpdateUserPayload, User, UserListResponse, UserQuery } from "../types/user-management.types";

export async function getUsersApi(query: UserQuery): Promise<UserListResponse> {
  const response = await api.get<UserListResponse>("/user-management", {
    params: query,
  });
  return response.data;
}

export async function getUserByIdApi(id: number): Promise<User> {
  const response = await api.get<User>(`/user-management/${id}`);
  return response.data;
}

export async function createUserApi(data: CreateUserPayload): Promise<User> {
  const response = await api.post<User>("/user-management", data);
  return response.data;
}

export async function updateUserApi(id: number, data: UpdateUserPayload): Promise<User> {
  const response = await api.put<User>(`/user-management/${id}`, data);
  return response.data;
}

export async function deleteUserApi(id: number): Promise<{ success: boolean }> {
  const response = await api.delete<{ success: boolean }>(`/user-management/${id}`);
  return response.data;
}
