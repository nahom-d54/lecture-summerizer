/**
 * Diarization types for speaker identification
 */

export interface DiarizedSegment {
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
  speaker: string; // Original speaker label (e.g., "Speaker 1", "Speaker_1")
  confidence: number; // 0-1 scale
}

export interface DiarizationResult {
  segments: DiarizedSegment[];
  speakers: string[]; // List of unique speaker labels found
  duration: number; // total duration in seconds
  speakerMapping?: Record<string, string>; // Applied mapping if provided
}

export interface DiarizationOptions {
  /**
   * Custom mapping of speaker labels to real names
   * Example: { "Speaker 1": "Professor", "Speaker 2": "Student" }
   */
  speakerMapping?: Record<string, string>;
  
  /**
   * Language hint for better diarization
   */
  language?: string;
  
  /**
   * Minimum confidence threshold for speaker identification
   * Segments below this threshold may not have speaker labels
   */
  minConfidence?: number;
}

export interface DiarizationInput {
  /**
   * Audio file path (for audio-based diarization)
   */
  audioPath?: string;
  
  /**
   * Text content (for text-based diarization or re-diarization)
   * If both audioPath and text are provided, audio takes precedence
   */
  text?: string;
  
  /**
   * Existing segments with timestamps (for re-diarization)
   * Useful when you want to re-analyze speaker labels for existing transcript
   */
  existingSegments?: Array<{
    startTime: number;
    endTime: number;
    text: string;
  }>;
}

