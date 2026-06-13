import { api } from "@/shared/config/api";
import { LoginInput, RegisterInput } from "../auth.schema";
import { User } from "../types/auth.types";



export async function loginApi(data: LoginInput): Promise<User> {
  const response = await api.post<User>("/auth/login", data);
  return response.data;
}

export async function registerApi(data: RegisterInput): Promise<User> {
  // Map frontend username to backend name
  const payload = {
    name: data.username,
    email: data.email,
    password: data.password,
  };
  const response = await api.post<User>("/auth/register", payload);
  return response.data;
}

export async function getMeApi(): Promise<User> {
  const response = await api.get<User>("/auth/me");
  return response.data;
}

export async function logoutApi(): Promise<{ success: boolean }> {
  const response = await api.post<{ success: boolean }>("/auth/logout");
  return response.data;
}
