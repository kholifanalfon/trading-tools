import { create } from "zustand";
import { loginApi, logoutApi, getMeApi } from "@/features/auth/services/auth.api";
import { User } from "@/features/auth/types/auth.types";
import { LoginInput } from "@/features/auth/auth.schema";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (data: LoginInput) => {
    try {
      const { user, token } = await loginApi(data);
      localStorage.setItem("token", token);
      set({ user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await logoutApi();
      localStorage.removeItem("token");
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      localStorage.removeItem("token"); // Clean up even if api fails
      set({ user: null, isAuthenticated: false });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await getMeApi();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem("token"); // Clean up invalid token
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
