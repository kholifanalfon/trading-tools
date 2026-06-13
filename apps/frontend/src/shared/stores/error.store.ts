import { create } from "zustand";

export interface StoredError {
  id: string;
  error: unknown;
}

interface ErrorState {
  errors: StoredError[];
  setError: (error: unknown) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const generateUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "e" + Math.random().toString(36).substring(2, 15);
};

export const useErrorStore = create<ErrorState>((set) => ({
  errors: [],
  setError: (error) =>
    set((state) => ({
      errors: [...state.errors, { id: generateUUID(), error }],
    })),
  removeError: (id) =>
    set((state) => ({
      errors: state.errors.filter((e) => e.id !== id),
    })),
  clearErrors: () => set({ errors: [] }),
}));
