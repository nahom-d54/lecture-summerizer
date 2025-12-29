import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Segment {
  text: string;
  speaker?: string;
  startTime: number;
  endTime: number;
  confidence?: number;
}

interface Props {
  segments: Segment[];
  speakers?: string[];
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const speakerColors = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800',
];

export function TranscriptViewer({ segments, speakers = [] }: Props) {
  const getSpeakerColor = (speaker?: string) => {
    if (!speaker) return 'bg-gray-100 text-gray-800';
    const index = speakers.indexOf(speaker);
    return speakerColors[index % speakerColors.length];
  };

  if (!segments || segments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No transcript available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Transcript</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
        {segments.map((segment, index) => (
          <div key={index} className="flex gap-3">
            <span className="text-xs text-gray-400 w-12 flex-shrink-0 pt-1">
              {formatTime(segment.startTime)}
            </span>
            <div className="flex-1">
              {segment.speaker && (
                <Badge
                  variant="outline"
                  className={`mb-1 text-xs ${getSpeakerColor(segment.speaker)}`}
                >
                  {segment.speaker}
                </Badge>
              )}
              <p
                className={`text-sm ${segment.confidence && segment.confidence < 0.7 ? 'text-gray-400 italic' : ''}`}
              >
                {segment.text}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
