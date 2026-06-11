import { useState } from "react";
import { RegisterInput } from "../auth.schema";

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (data.email === "error@example.com") {
        throw new Error("Email already in use");
      }

      options?.onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
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
