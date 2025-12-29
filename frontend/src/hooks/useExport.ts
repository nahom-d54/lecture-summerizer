import { useMutation } from '@tanstack/react-query';
import { recordingsApi } from '@/lib/api';

type ExportFormat = 'pdf' | 'txt' | 'docx';

interface ExportOptions {
  recordingId: string;
  title: string;
}

export function useExport({ recordingId, title }: ExportOptions) {
  return useMutation({
    mutationFn: (format: ExportFormat) => recordingsApi.export(recordingId, format),
    onSuccess: (response, format) => {
      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeTitle}.${format}`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}
