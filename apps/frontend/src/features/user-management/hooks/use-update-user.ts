import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserApi } from "../services/user-management.api";
import { UpdateUserPayload } from "../types/user-management.types";
import { userManagementKeys } from "../user-management.keys";
import { ApiError } from "@/shared/config/api";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<any, ApiError, { id: number; data: UpdateUserPayload }>({
    mutationFn: ({ id, data }) => updateUserApi(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userManagementKeys.detail(variables.id) });
    },
  });
}
