import { useQuery } from "@tanstack/react-query";
import { infoKeys } from "../info.keys";
import { fetchTechStackInfo } from "../services/info.api";

export function useGetInfo() {
  return useQuery({
    queryKey: infoKeys.all,
    queryFn: fetchTechStackInfo,
  });
}
