import { FileAudio } from 'lucide-react';
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RecordingCard({
  recording,
  onDelete,
}: {
  recording: Recording;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-slate-200 bg-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-blue-500 transition-colors" />

      <Link to={`/recordings/${recording.id}`} className="block">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-slate-900 truncate leading-tight group-hover:text-blue-600 transition-colors">
                {recording.title || 'Untitled Recording'}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={statusVariants[recording.status] || 'secondary'}
                className="shrink-0 capitalize font-medium"
              >
                {recording.status.replace(/_/g, ' ')}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 -mr-2"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(recording.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-5">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <FileAudio className="h-3.5 w-3.5 text-slate-400" />
              <span>{recording.format.split('/')[1]?.toUpperCase() || 'AUDIO'}</span>
            </div>
            {/* Duration removed as per user request */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-slate-400">{formatDate(recording.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
