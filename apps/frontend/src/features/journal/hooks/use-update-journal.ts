import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateJournalApi } from "../services/journal.api";
import { journalKeys } from "../journal.keys";
import { UpdateJournalPayload } from "../types/journal.types";

export function useUpdateJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateJournalPayload }) => updateJournalApi(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: journalKeys.detail(variables.id) });
      // Invalidate portfolio caches since journal status/close might be linked to portfolios
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
    },
  });
}
