import { useQuery } from "@tanstack/react-query";
import { getJournalsApi } from "../services/journal.api";
import { journalKeys } from "../journal.keys";

export function useGetJournals() {
  return useQuery({
    queryKey: journalKeys.lists(),
    queryFn: getJournalsApi,
  });
}
