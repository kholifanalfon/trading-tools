export interface User {
  id: number;
  fullName: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: "user" | "admin";
  isActive?: boolean;
}

export interface UserQuery {
  page: number;
  limit: number;
  search?: string;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
