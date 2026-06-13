import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserApi } from "../services/user-management.api";
import { CreateUserPayload } from "../types/user-management.types";
import { userManagementKeys } from "../user-management.keys";
import { ApiError } from "@/shared/config/api";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<any, ApiError, CreateUserPayload>({
    mutationFn: (data: CreateUserPayload) => createUserApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.lists() });
    },
  });
}
