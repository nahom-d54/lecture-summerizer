/**
 * Transcription types for the lecture summarizer
 */

export interface TranscriptSegment {
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
  speaker?: string;
  confidence: number; // 0-1 scale
}

export interface TranscriptionResult {
  fullText: string;
  segments: TranscriptSegment[];
  speakers: string[];
  duration: number; // total duration in seconds
}

export interface TranscriptionOptions {
  language?: string;
  enableSpeakerDiarization?: boolean;
}

export const LOW_CONFIDENCE_THRESHOLD = 0.7;
