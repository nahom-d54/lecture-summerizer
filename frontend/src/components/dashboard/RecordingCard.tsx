import { Calendar, Clock, FileAudio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Recording {
  id: string;
  title: string;
  status: string;
  duration?: number;
  createdAt: string;
  format: string;
}

const statusVariants: Record<
  string,
  'default' | 'secondary' | 'success' | 'warning' | 'destructive'
> = {
  completed: 'success',
  processing: 'warning',
  transcribing: 'warning',
  summarizing: 'warning',
  extracting_action_items: 'warning',
  failed: 'destructive',
  uploading: 'secondary',
};

function formatDuration(seconds?: number): string {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function RecordingCard({ recording }: { recording: Recording }) {
  return (
    <Link to={`/recordings/${recording.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base font-medium truncate pr-2">{recording.title}</CardTitle>
            <Badge variant={statusVariants[recording.status] || 'secondary'}>
              {recording.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FileAudio className="h-4 w-4" />
              <span>{recording.format.split('/')[1]?.toUpperCase() || 'Audio'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(recording.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(recording.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
