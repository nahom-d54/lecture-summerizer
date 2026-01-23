import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Inbox, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { recordingsApi } from '@/lib/api';
import { RecordingCard } from './RecordingCard';

interface Props {
  search?: string;
  status?: string;
}

export function RecordingList({ search, status }: Props) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['recordings', search, status],
    queryFn: () => recordingsApi.list({ search, status }),
  });

  const deleteMutation = useMutation({
    mutationFn: recordingsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading your library...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
          <Inbox className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Failed to load recordings</h3>
        <p className="text-slate-500 max-w-sm mx-auto mb-6">
          We encountered an issue while fetching your recordings. Please check your connection and
          try again.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  const recordings = data?.data?.data || [];

  if (recordings.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
          <Inbox className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          {search ? 'No matches found' : 'Your library is empty'}
        </h3>
        <p className="text-slate-500 max-w-sm mx-auto mb-6">
          {search
            ? `We couldn't find any recordings matching "${search}". Try adjusting your search keywords.`
            : 'Get started by uploading your first lecture or meeting recording.'}
        </p>
        {!search && (
          <Link to="/upload">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Upload Recording</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* biome-ignore lint/suspicious/noExplicitAny: Recording type definition pending */}
      {recordings.map((recording: any) => (
        <RecordingCard key={recording.id} recording={recording} onDelete={handleDelete} />
      ))}
    </div>
  );
}
