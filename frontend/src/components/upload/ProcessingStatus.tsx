import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getStageProgress, PROCESSING_STAGES, useProcessingStatus } from '@/hooks';

interface Props {
  recordingId: string;
  onComplete?: () => void;
}

export function ProcessingStatus({ recordingId, onComplete }: Props) {
  const { data } = useProcessingStatus(recordingId, { onComplete });

  const currentStatus = data?.data?.status || 'uploading';
  const currentIndex = PROCESSING_STAGES.findIndex(s => s.key === currentStatus);
  const progress = getStageProgress(currentStatus);
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
        {PROCESSING_STAGES.map((stage, index) => {
          const isComplete = currentIndex > index || currentStatus === 'completed';
          const isCurrent = currentIndex === index && currentStatus !== 'completed';

          return (
            <div key={stage.key} className="flex items-center gap-3 text-sm">
              <StageIcon isComplete={isComplete} isCurrent={isCurrent} isFailed={isFailed} />
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

function StageIcon({
  isComplete,
  isCurrent,
  isFailed,
}: {
  isComplete: boolean;
  isCurrent: boolean;
  isFailed: boolean;
}) {
  if (isComplete) return <CheckCircle className="h-4 w-4 text-green-600" />;
  if (isCurrent) {
    if (isFailed) return <XCircle className="h-4 w-4 text-red-600" />;
    return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
  }
  return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
}
