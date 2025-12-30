/**
 * Diarization Service
 *
 * Speaker diarization is now handled by the Python transcription service.
 * This service provides a wrapper for diarization-specific operations.
 */
import { logger } from '@/config/logger';
import {
  DiarizationInput,
  DiarizationOptions,
  DiarizationResult,
  DiarizedSegment,
} from '@/types/diarization.types';

// Python transcription service URL
const TRANSCRIPTION_SERVICE_URL = process.env.TRANSCRIPTION_SERVICE_URL || 'http://localhost:8000';

// Response from Python transcription service
interface WhisperResponse {
  success: boolean;
  language?: string;
  duration?: number;
  text?: string;
  segments?: Array<{
    speaker: string;
    start: number;
    end: number;
    text: string;
  }>;
  error?: string;
}

export class DiarizationService {
  /**
   * Perform speaker diarization on audio input.
   * Delegates to the Python Whisper service with diarization enabled.
   */
  async diarize(
    input: DiarizationInput,
    _options: DiarizationOptions = {}
  ): Promise<DiarizationResult> {
    try {
      // Validate input
      if (!input.audioPath) {
        throw new Error('audioPath is required for diarization');
      }

      logger.info(`Starting diarization for file: ${input.audioPath}`);

      // Call Python transcription service with diarization enabled
      const response = await fetch(`${TRANSCRIPTION_SERVICE_URL}/transcribe-path`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_path: input.audioPath,
          enable_diarization: true, // Always enable for diarization
          language: null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Diarization service error: ${response.status} ${response.statusText}`);
      }

      const result = (await response.json()) as WhisperResponse;

      if (!result.success) {
        throw new Error(result.error || 'Diarization failed');
      }

      // Convert to DiarizationResult format
      return this.convertToDiarizationResult(result);
    } catch (error) {
      logger.error('Error performing diarization:', error);
      throw error;
    }
  }

  /**
   * Convert Python service response to DiarizationResult format
   */
  private convertToDiarizationResult(response: WhisperResponse): DiarizationResult {
    const segments: DiarizedSegment[] = [];
    const speakerSet = new Set<string>();

    if (response.segments) {
      for (const seg of response.segments) {
        speakerSet.add(seg.speaker);
        segments.push({
          startTime: seg.start,
          endTime: seg.end,
          text: seg.text,
          speaker: seg.speaker,
          confidence: 0.9,
        });
      }
    }

    return {
      segments,
      speakers: Array.from(speakerSet),
      duration: response.duration || 0,
    };
  }
}

export const diarizationService = new DiarizationService();
