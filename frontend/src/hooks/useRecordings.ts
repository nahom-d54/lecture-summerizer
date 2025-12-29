import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recordingsApi } from '@/lib/api';

interface Recording {
  id: string;
  title: string;
  status: string;
  duration?: number;
  createdAt: string;
  format: string;
  fileSize: string;
}

interface RecordingsResponse {
  success: boolean;
  data: Recording[];
}

export function useRecordings(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['recordings', params?.search, params?.status],
    queryFn: async () => {
      const response = await recordingsApi.list(params);
      return response.data as RecordingsResponse;
    },
  });
}

export function useRecording(id: string | undefined) {
  return useQuery({
    queryKey: ['recording', id],
    queryFn: async () => {
      if (!id) throw new Error('Recording ID required');
      const response = await recordingsApi.get(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useDeleteRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recordingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
    },
  });
}
