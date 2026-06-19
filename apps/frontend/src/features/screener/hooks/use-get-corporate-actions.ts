import { useQuery } from "@tanstack/react-query";
import { getCorporateActionsApi } from "../services/screener.api";
import { screenerKeys } from "../screener.keys";
import { ApiError } from "@/shared/config/api";

export function useGetCorporateActions(symbol: string) {
  return useQuery<{ dividends: any[]; splits: any[] }, ApiError>({
    queryKey: [...screenerKeys.all, "corp-actions", symbol],
    queryFn: () => getCorporateActionsApi(symbol),
    enabled: !!symbol,
    staleTime: 30 * 60 * 1000, // 30 mins
  });
}
