import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', icon: 'bg-blue-500' },
  { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', icon: 'bg-green-500' },
  {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
    icon: 'bg-purple-500',
  },
  {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
    icon: 'bg-orange-500',
  },
  { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', icon: 'bg-pink-500' },
  {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-300',
    icon: 'bg-indigo-500',
  },
];

export function TranscriptViewer({ segments, speakers = [] }: Props) {
  // Check if we have speaker information
  const hasSpeakers = segments.some(seg => seg.speaker);

  // Extract unique speakers from segments if not provided
  const actualSpeakers =
    speakers.length > 0
      ? speakers
      : (Array.from(new Set(segments.map(s => s.speaker).filter(Boolean))) as string[]);

  // Map a given speaker label to a stable color, even if speakers prop is empty
  const getSpeakerColor = (speaker?: string) => {
    if (!speaker) return speakerColors[0];
    const index = actualSpeakers.indexOf(speaker);
    return speakerColors[(index >= 0 ? index : 0) % speakerColors.length];
  };

  if (!segments || segments.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">No transcript available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with speaker count */}
      {hasSpeakers && actualSpeakers.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-700">Speakers:</span>
          {actualSpeakers.map((speaker, i) => {
            const colors = getSpeakerColor(speaker);
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: Speakers are stable
              <div
                key={i}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colors.bg} ${colors.border}`}
              >
                <div className={`w-2 h-2 rounded-full ${colors.icon}`} />
                <span className={`text-sm font-medium ${colors.text}`}>{speaker}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Transcript segments */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {segments.map((segment, index) => {
          const colors = getSpeakerColor(segment.speaker);
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: Segments have stable order
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.02, 1) }}
              className="group"
            >
              <div className="flex gap-4">
                {/* Timestamp */}
                <div className="shrink-0 w-16 pt-1">
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {formatTime(segment.startTime)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div
                    className={`rounded-xl p-4 border-2 ${colors.bg} ${colors.border} transition-all group-hover:shadow-md`}
                  >
                    {/* Speaker label */}
                    {segment.speaker && (
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-8 h-8 rounded-full ${colors.icon} flex items-center justify-center`}
                        >
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className={`font-semibold text-sm ${colors.text}`}>
                          {segment.speaker}
                        </span>
                      </div>
                    )}

                    {/* Text */}
                    <p
                      className={`text-sm leading-relaxed ${
                        segment.confidence && segment.confidence < 0.7
                          ? 'text-slate-400 italic'
                          : 'text-slate-700'
                      }`}
                    >
                      {segment.text}
                    </p>

                    {/* Low confidence indicator */}
                    {segment.confidence && segment.confidence < 0.7 && (
                      <span className="text-xs text-slate-400 mt-2 inline-block">
                        (Low confidence)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
