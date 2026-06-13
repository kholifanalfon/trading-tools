import { useMutation } from "@tanstack/react-query";
import { LoginInput } from "../auth.schema";
import { useAuthStore } from "@/shared/stores/auth.store";

export function useLogin() {
  const login = useAuthStore((state) => state.login);

  const mutation = useMutation({
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
