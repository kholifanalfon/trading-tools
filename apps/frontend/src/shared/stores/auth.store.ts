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
      const user = await loginApi(data);
      set({ user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await logoutApi();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await getMeApi();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
