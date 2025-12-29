import { useQuery } from '@tanstack/react-query';
import { recordingsApi } from '@/lib/api';

interface StatusResponse {
  success: boolean;
  data: {
    status: string;
  };
}

const TERMINAL_STATUSES = ['completed', 'failed'];

export function useProcessingStatus(
  recordingId: string | undefined,
  options?: { onComplete?: () => void }
) {
  return useQuery({
    queryKey: ['recording-status', recordingId],
    queryFn: async () => {
      if (!recordingId) throw new Error('Recording ID required');
      const response = await recordingsApi.getStatus(recordingId);
      return response.data as StatusResponse;
    },
    enabled: !!recordingId,
    refetchInterval: query => {
      const status = query.state.data?.data?.status;
      if (status && TERMINAL_STATUSES.includes(status)) {
        options?.onComplete?.();
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });
}

export function isProcessing(status?: string): boolean {
  if (!status) return false;
  return !TERMINAL_STATUSES.includes(status);
}

export function getStatusLabel(status?: string): string {
  if (!status) return 'Unknown';
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const PROCESSING_STAGES = [
  { key: 'uploading', label: 'Uploading' },
  { key: 'transcribing', label: 'Transcribing' },
  { key: 'summarizing', label: 'Summarizing' },
  { key: 'extracting_action_items', label: 'Extracting Action Items' },
  { key: 'completed', label: 'Completed' },
];

export function getStageProgress(status?: string): number {
  if (!status) return 0;
  if (status === 'completed') return 100;
  if (status === 'failed') return 0;
  const index = PROCESSING_STAGES.findIndex(s => s.key === status);
  if (index === -1) return 0;
  return ((index + 1) / PROCESSING_STAGES.length) * 100;
}
