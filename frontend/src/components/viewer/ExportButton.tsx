import { useMutation } from '@tanstack/react-query';
import { Download, FileText, FileType, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { recordingsApi } from '@/lib/api';

interface Props {
  recordingId: string;
  title: string;
}

const formats = [
  { value: 'pdf', label: 'PDF', icon: FileType },
  { value: 'txt', label: 'Text', icon: FileText },
  { value: 'docx', label: 'Word', icon: FileText },
] as const;

export function ExportButton({ recordingId, title }: Props) {
  const [open, setOpen] = useState(false);

  const exportMutation = useMutation({
    mutationFn: (format: 'pdf' | 'txt' | 'docx') => recordingsApi.export(recordingId, format),
    onSuccess: (response, format) => {
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setOpen(false);
    },
  });

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setOpen(!open)} disabled={exportMutation.isPending}>
        {exportMutation.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Export
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
            onKeyDown={e => e.key === 'Escape' && setOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-20">
            {formats.map(({ value, label, icon: Icon }) => (
              <button
                type="button"
                key={value}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                onClick={() => exportMutation.mutate(value)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
