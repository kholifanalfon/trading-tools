import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJournalApi } from "../services/journal.api";
import { journalKeys } from "../journal.keys";

export function useCreateJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJournalApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() });
    },
  });
}
