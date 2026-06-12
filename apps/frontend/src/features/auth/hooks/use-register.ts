import { useState } from "react";
import { RegisterInput } from "../auth.schema";
import { registerApi } from "../services/auth.api";

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerMutation = async (
    data: RegisterInput,
    options?: { onSuccess?: () => void }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerApi(data);
      options?.onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: registerMutation,
    isLoading,
    error,
  };
}
