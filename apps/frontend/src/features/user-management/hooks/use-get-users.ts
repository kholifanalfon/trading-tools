import { useQuery } from "@tanstack/react-query";
import { getUsersApi } from "../services/user-management.api";
import { UserQuery } from "../types/user-management.types";
import { userManagementKeys } from "../user-management.keys";

export function useGetUsers(query: UserQuery) {
  return useQuery({
    queryKey: userManagementKeys.list(query),
    queryFn: () => getUsersApi(query),
  });
}
