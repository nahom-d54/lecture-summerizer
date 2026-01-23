/**
 * Transcription Service
 *
 * Calls the Python Whisper transcription service for speech-to-text.
 * NO LONGER uses Gemini for transcription - Gemini is only for summarization.
 */
import { logger } from '@/config/logger';
import { CreateTranscriptData, transcriptRepository } from '@/repositories/transcript.repository';
import { storageService } from '@/services/storage.service';
import {
  LOW_CONFIDENCE_THRESHOLD,
  TranscriptionOptions,
  TranscriptionResult,
  TranscriptSegment,
} from '@/types/transcription.types';
import { aiDiarizationService } from './ai-diarization.service';

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

export class TranscriptionService {
  /**
   * Transcribe an audio file using the Python Whisper service
   */
  async transcribeAudio(
    filePath: string,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    try {
      logger.info(`Starting transcription for file: ${filePath}`);

      // Call Python transcription service (without diarization to avoid pyannote issues)
      const response = await fetch(`${TRANSCRIPTION_SERVICE_URL}/transcribe-path`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_path: filePath,
          enable_diarization: false, // Disable pyannote, use AI instead
          language: options.language || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Transcription service error: ${response.status} ${response.statusText}`);
      }

      const result = (await response.json()) as WhisperResponse;

      if (!result.success) {
        throw new Error(result.error || 'Transcription failed');
      }

      // Convert Python service response to our internal format
      let transcriptionResult = this.convertWhisperResponse(result);

      // Apply AI-based speaker diarization if enabled
      if (options.enableSpeakerDiarization ?? true) {
        transcriptionResult = await this.applyAIDiarization(transcriptionResult);
      }

      logger.info(`Transcription completed for file: ${filePath}`);
      return transcriptionResult;
    } catch (error) {
      logger.error(`Error transcribing audio file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Transcribe a recording by its storage path and save to database
   */
  async transcribeRecording(
    recordingId: string,
    storagePath: string
  ): Promise<CreateTranscriptData> {
    const filePath = storageService.getFilePath(storagePath);
    const result = await this.transcribeAudio(filePath);

    const transcriptData: CreateTranscriptData = {
      recordingId,
      fullText: result.fullText,
      segments: result.segments,
      speakers: result.speakers,
      duration: result.duration,
    };

    await transcriptRepository.create(transcriptData);
    return transcriptData;
  }

  /**
   * Get transcript for a recording
   */
  async getTranscript(recordingId: string) {
    return transcriptRepository.findByRecordingId(recordingId);
  }

  /**
   * Get segments with low confidence that may need review
   */
  async getLowConfidenceSegments(recordingId: string) {
    return transcriptRepository.getLowConfidenceSegments(recordingId, LOW_CONFIDENCE_THRESHOLD);
  }

  /**
   * Convert Python Whisper service response to internal TranscriptionResult format
   */
  private convertWhisperResponse(response: WhisperResponse): TranscriptionResult {
    const fullText = response.text || '';
    const duration = response.duration || 0;

    // Extract unique speakers from segments
    const speakers: string[] = [];
    const segments: TranscriptSegment[] = [];

    if (response.segments && response.segments.length > 0) {
      // Diarization was enabled - we have speaker-labeled segments
      for (const seg of response.segments) {
        // Track unique speakers
        if (seg.speaker && !speakers.includes(seg.speaker)) {
          speakers.push(seg.speaker);
        }

        segments.push({
          startTime: seg.start,
          endTime: seg.end,
          text: seg.text,
          speaker: seg.speaker,
          confidence: 0.9, // Whisper is generally high confidence
        });
      }
    } else {
      // No diarization - create a single segment with full text
      segments.push({
        startTime: 0,
        endTime: duration,
        text: fullText,
        confidence: 0.9,
      });
    }

    return {
      fullText,
      segments,
      speakers,
      duration,
    };
  }

  /**
   * Apply AI-based speaker diarization to transcription result
   */
  private async applyAIDiarization(result: TranscriptionResult): Promise<TranscriptionResult> {
    try {
      logger.info('Applying AI-based speaker diarization...');

      // Use AI to identify speakers
      const diarizedSegments = await aiDiarizationService.diarizeTranscript(result.segments);

      // Extract unique speakers
      const speakers = Array.from(new Set(diarizedSegments.map(s => s.speaker)));

      logger.info(`AI diarization applied: ${speakers.length} speakers identified`);

      return {
        ...result,
        segments: diarizedSegments,
        speakers,
      };
    } catch (error) {
      logger.error('AI diarization failed, returning original result:', error);
      return result;
    }
  }

  /**
   * Check if the Python transcription service is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${TRANSCRIPTION_SERVICE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const transcriptionService = new TranscriptionService();
