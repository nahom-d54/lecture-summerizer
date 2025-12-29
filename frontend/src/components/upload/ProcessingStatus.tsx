import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { recordingsApi } from '@/lib/api';

const stages = [
  { key: 'uploading', label: 'Uploading' },
  { key: 'transcribing', label: 'Transcribing' },
  { key: 'summarizing', label: 'Summarizing' },
  { key: 'extracting_action_items', label: 'Extracting Action Items' },
  { key: 'completed', label: 'Completed' },
];

interface Props {
  recordingId: string;
  onComplete?: () => void;
}

export function ProcessingStatus({ recordingId, onComplete }: Props) {
  const { data } = useQuery({
    queryKey: ['recording-status', recordingId],
    queryFn: () => recordingsApi.getStatus(recordingId),
    refetchInterval: query => {
      const status = query.state.data?.data?.data?.status;
      if (status === 'completed' || status === 'failed') {
        onComplete?.();
        return false;
      }
      return 2000;
    },
  });

  const currentStatus = data?.data?.data?.status || 'uploading';
  const currentIndex = stages.findIndex(s => s.key === currentStatus);
  const progress = currentStatus === 'completed' ? 100 : ((currentIndex + 1) / stages.length) * 100;
  const isFailed = currentStatus === 'failed';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Processing Status</span>
        <span className="text-gray-500 capitalize">{currentStatus.replace(/_/g, ' ')}</span>
      </div>

      <Progress
        value={isFailed ? 100 : progress}
        className={isFailed ? '[&>div]:bg-red-500' : ''}
      />

      <div className="space-y-2">
        {stages.map((stage, index) => {
          const isComplete = currentIndex > index || currentStatus === 'completed';
          const isCurrent = currentIndex === index && currentStatus !== 'completed';

          return (
            <div key={stage.key} className="flex items-center gap-3 text-sm">
              {isComplete ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : isCurrent ? (
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              ) : isFailed && isCurrent ? (
                <XCircle className="h-4 w-4 text-red-600" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
              )}
              <span
                className={
                  isComplete
                    ? 'text-green-600'
                    : isCurrent
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-400'
                }
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {isFailed && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          Processing failed. Please try uploading again.
        </div>
      )}
    </div>
  );
}
