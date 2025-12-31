import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { recordingsApi } from '@/lib/api';
import { RecordingCard } from './RecordingCard';

interface Props {
  search?: string;
  status?: string;
}

export function RecordingList({ search, status }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['recordings', search, status],
    queryFn: () => recordingsApi.list({ search, status }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load recordings. Please try again.
      </div>
    );
  }

  const recordings = data?.data?.data || [];

  if (recordings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {search
          ? 'No recordings match your search.'
          : 'No recordings yet. Upload your first lecture!'}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* biome-ignore lint/suspicious/noExplicitAny: Recording type definition pending */}
      {recordings.map((recording: any) => (
        <RecordingCard key={recording.id} recording={recording} />
      ))}
    </div>
  );
}
