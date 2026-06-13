import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserApi } from "../services/user-management.api";
import { userManagementKeys } from "../user-management.keys";
import { ApiError } from "@/shared/config/api";

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<any, ApiError, number>({
    mutationFn: (id) => deleteUserApi(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userManagementKeys.detail(id) });
    },
  });
}
