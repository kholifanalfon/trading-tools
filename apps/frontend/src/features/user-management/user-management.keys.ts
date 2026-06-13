export const userManagementKeys = {
  all: ["user-management"] as const,
  lists: () => [...userManagementKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...userManagementKeys.lists(), { filters }] as const,
  details: () => [...userManagementKeys.all, "detail"] as const,
  detail: (id: number) => [...userManagementKeys.details(), id] as const,
};
