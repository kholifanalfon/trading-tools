import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteJournalApi } from "../services/journal.api";
import { journalKeys } from "../journal.keys";

export function useDeleteJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteJournalApi,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: journalKeys.detail(id) });
    },
  });
}
