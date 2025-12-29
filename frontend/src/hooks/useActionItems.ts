import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordingsApi } from '@/lib/api';

interface ActionItem {
  id: string;
  description: string;
  assignee?: string;
  deadline?: string;
  completed: boolean;
  segmentStartTime?: number;
}

export function useToggleActionItem(recordingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actionItemId, completed }: { actionItemId: string; completed: boolean }) =>
      recordingsApi.updateActionItem(recordingId, actionItemId, completed),
    onMutate: async ({ actionItemId, completed }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['recording', recordingId] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['recording', recordingId]);

      // Optimistically update
      queryClient.setQueryData(
        ['recording', recordingId],
        (old: { data: { actionItems: ActionItem[] } }) => {
          if (!old?.data?.actionItems) return old;
          return {
            ...old,
            data: {
              ...old.data,
              actionItems: old.data.actionItems.map((item: ActionItem) =>
                item.id === actionItemId ? { ...item, completed } : item
              ),
            },
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['recording', recordingId], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['recording', recordingId] });
    },
  });
}
