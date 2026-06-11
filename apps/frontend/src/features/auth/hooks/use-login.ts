import { useState } from "react";
import { LoginInput } from "../auth.schema";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = async (
    data: LoginInput,
    options?: { onSuccess?: (data: { token: string }) => void }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (data.email === "error@example.com") {
        throw new Error("Invalid email or password");
      }

      options?.onSuccess?.({ token: "mock-jwt-token" });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
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
