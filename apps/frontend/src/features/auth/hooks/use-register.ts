import { useMutation } from "@tanstack/react-query";
import { RegisterInput } from "../auth.schema";
import { registerApi } from "../services/auth.api";
import { ApiError } from "@/shared/config/api";

export function useRegister() {
  const mutation = useMutation<void, ApiError, RegisterInput>({
    mutationFn: async (data: RegisterInput) => {
      await registerApi(data);
    },
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
