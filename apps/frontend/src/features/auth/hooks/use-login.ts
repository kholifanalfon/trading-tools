import { useState } from "react";
import { LoginInput } from "../auth.schema";
import { useAuthStore } from "@/shared/stores/auth.store";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);

  const loginMutation = async (
    data: LoginInput,
    options?: { onSuccess?: () => void }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data);
      options?.onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: loginMutation,
    isLoading,
    error,
  };
}
