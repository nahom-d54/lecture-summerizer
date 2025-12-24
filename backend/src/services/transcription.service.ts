import fs from 'fs/promises';
import path from 'path';
import { gemini } from '@/config/gemini';
import { logger } from '@/config/logger';
import { CreateTranscriptData, transcriptRepository } from '@/repositories/transcript.repository';
import { storageService } from '@/services/storage.service';
import {
  LOW_CONFIDENCE_THRESHOLD,
  TranscriptionOptions,
  TranscriptionResult,
  TranscriptSegment,
} from '@/types/transcription.types';

// Supported audio formats for Gemini
const SUPPORTED_AUDIO_FORMATS = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];

export class TranscriptionService {
  private model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * Transcribe an audio file using Google Gemini
   */
  async transcribeAudio(
    filePath: string,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    try {
      logger.info(`Starting transcription for file: ${filePath}`);

      // Read the audio file
      const audioBuffer = await fs.readFile(filePath);
      const mimeType = this.getMimeType(filePath);

      if (!SUPPORTED_AUDIO_FORMATS.includes(mimeType)) {
        throw new Error(`Unsupported audio format: ${mimeType}`);
      }

      // Convert to base64 for Gemini API
      const audioBase64 = audioBuffer.toString('base64');

      // Build the prompt for transcription
      const prompt = this.buildTranscriptionPrompt(options);

      // Call Gemini API with multimodal input
      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType,
            data: audioBase64,
          },
        },
        { text: prompt },
      ]);

      const response = result.response;
      const responseText = response.text();

      // Parse the response into structured transcript
      const transcriptionResult = this.parseTranscriptionResponse(responseText);

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
   * Build the transcription prompt for Gemini
   */
  private buildTranscriptionPrompt(options: TranscriptionOptions): string {
    const languageHint = options.language ? `The audio is in ${options.language}.` : '';
    const speakerHint = options.enableSpeakerDiarization
      ? 'Identify different speakers and label them as Speaker 1, Speaker 2, etc.'
      : '';

    return `
Transcribe this audio file accurately. ${languageHint} ${speakerHint}

Return the transcription in the following JSON format:
{
  "fullText": "The complete transcription as a single string",
  "segments": [
    {
      "startTime": 0,
      "endTime": 5.5,
      "text": "Segment text here",
      "speaker": "Speaker 1",
      "confidence": 0.95
    }
  ],
  "speakers": ["Speaker 1", "Speaker 2"],
  "duration": 120
}

Rules:
- startTime and endTime are in seconds
- confidence is a value between 0 and 1 indicating transcription accuracy
- Mark segments with unclear audio or uncertain words with lower confidence (below 0.7)
- If speaker identification is not possible, omit the speaker field
- Ensure all timestamps are present and sequential
- Return ONLY valid JSON, no additional text
`.trim();
  }

  /**
   * Parse Gemini response into TranscriptionResult
   */
  parseTranscriptionResponse(responseText: string): TranscriptionResult {
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      let jsonStr = responseText;
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);

      // Validate and normalize the response
      const result: TranscriptionResult = {
        fullText: parsed.fullText || '',
        segments: this.normalizeSegments(parsed.segments || []),
        speakers: parsed.speakers || [],
        duration: parsed.duration || 0,
      };

      // Validate timestamps are present
      this.validateTimestamps(result.segments);

      return result;
    } catch (error) {
      logger.error('Error parsing transcription response:', error);
      // Return a fallback result with the raw text
      return {
        fullText: responseText,
        segments: [
          {
            startTime: 0,
            endTime: 0,
            text: responseText,
            confidence: 0.5, // Low confidence for unparsed response
          },
        ],
        speakers: [],
        duration: 0,
      };
    }
  }

  /**
   * Normalize segments to ensure consistent structure
   */
  private normalizeSegments(segments: unknown[]): TranscriptSegment[] {
    return segments.map((seg: unknown, index: number) => {
      const segment = seg as Record<string, unknown>;
      return {
        startTime: Number(segment.startTime) || 0,
        endTime: Number(segment.endTime) || 0,
        text: String(segment.text || ''),
        speaker: segment.speaker ? String(segment.speaker) : undefined,
        confidence: Math.min(1, Math.max(0, Number(segment.confidence) || 0.5)),
      };
    });
  }

  /**
   * Validate that all segments have timestamps
   */
  private validateTimestamps(segments: TranscriptSegment[]): void {
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (segment.startTime === undefined || segment.endTime === undefined) {
        logger.warn(`Segment ${i} missing timestamps`);
      }
      if (segment.startTime > segment.endTime) {
        logger.warn(`Segment ${i} has invalid timestamps: start > end`);
      }
    }
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.mp3': 'audio/mp3',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.webm': 'audio/webm',
      '.m4a': 'audio/mp4',
    };
    return mimeTypes[ext] || 'audio/mpeg';
  }
}

export const transcriptionService = new TranscriptionService();
