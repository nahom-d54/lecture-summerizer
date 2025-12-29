import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recordingsApi } from '@/lib/api';

interface UploadResponse {
  success: boolean;
  data: {
    id: string;
    filename: string;
    status: string;
  };
}

export function useUpload() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) => recordingsApi.upload(file, setProgress),
    onSuccess: response => {
      const data = response.data as UploadResponse;
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
      if (data.data?.id) {
        navigate(`/recordings/${data.data.id}`);
      }
    },
    onSettled: () => {
      setProgress(0);
    },
  });

  return {
    upload: mutation.mutate,
    progress,
    isUploading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
