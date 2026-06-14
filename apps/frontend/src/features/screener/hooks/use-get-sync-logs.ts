import { useQuery } from "@tanstack/react-query";
import { getSyncLogsApi } from "../services/screener.api";
import { screenerKeys } from "../screener.keys";
import { ApiError } from "@/shared/config/api";

export function useGetSyncLogs() {
  return useQuery<any[], ApiError>({
    queryKey: [...screenerKeys.all, "logs"],
    queryFn: getSyncLogsApi,
    staleTime: 10000,
  });
}
