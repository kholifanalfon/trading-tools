import { useMutation } from "@tanstack/react-query";
import { LoginInput } from "../auth.schema";
import { useAuthStore } from "@/shared/stores/auth.store";
import { ApiError } from "@/shared/config/api";

export function useLogin() {
  const login = useAuthStore((state) => state.login);

  const mutation = useMutation<void, ApiError, LoginInput>({
    mutationFn: async (data: LoginInput) => {
      await login(data);
    },
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
