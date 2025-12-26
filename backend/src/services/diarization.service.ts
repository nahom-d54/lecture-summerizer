import fs from 'fs/promises';
import path from 'path';
import { gemini } from '@/config/gemini';
import { logger } from '@/config/logger';
import {
  DiarizationInput,
  DiarizationOptions,
  DiarizationResult,
  DiarizedSegment,
} from '@/types/diarization.types';

// Supported audio formats for Gemini
const SUPPORTED_AUDIO_FORMATS = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];

export class DiarizationService {
  private model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * Perform speaker diarization on audio or text input
   * Identifies "Who spoke when" with timestamps
   */
  async diarize(input: DiarizationInput, options: DiarizationOptions = {}): Promise<DiarizationResult> {
    try {
      // Validate input
      this.validateInput(input);

      // Determine input type and process accordingly
      if (input.audioPath) {
        return await this.diarizeAudio(input.audioPath, options);
      } else if (input.text || input.existingSegments) {
        return await this.diarizeText(input, options);
      } else {
        throw new Error('Either audioPath, text, or existingSegments must be provided');
      }
    } catch (error) {
      logger.error('Error performing diarization:', error);
      throw error;
    }
  }

  /**
   * Perform diarization on audio file
   */
  private async diarizeAudio(
    audioPath: string,
    options: DiarizationOptions
  ): Promise<DiarizationResult> {
    logger.info(`Starting audio diarization for file: ${audioPath}`);

    // Read the audio file
    const audioBuffer = await fs.readFile(audioPath);
    const mimeType = this.getMimeType(audioPath);

    if (!SUPPORTED_AUDIO_FORMATS.includes(mimeType)) {
      throw new Error(`Unsupported audio format: ${mimeType}`);
    }

    // Convert to base64 for Gemini API
    const audioBase64 = audioBuffer.toString('base64');

    // Build the prompt for diarization
    const prompt = this.buildDiarizationPrompt(options);

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

    // Parse the response into structured diarization result
    const diarizationResult = this.parseDiarizationResponse(responseText);

    // Apply speaker mapping if provided
    const mappedResult = this.applySpeakerMapping(diarizationResult, options.speakerMapping);

    logger.info(`Diarization completed for file: ${audioPath}`);
    return mappedResult;
  }

  /**
   * Perform diarization on text input
   * Useful for re-diarization of existing transcripts
   */
  private async diarizeText(
    input: DiarizationInput,
    options: DiarizationOptions
  ): Promise<DiarizationResult> {
    logger.info('Starting text-based diarization');

    // Prepare text content
    let textContent = '';
    if (input.existingSegments && input.existingSegments.length > 0) {
      // Format existing segments with timestamps
      textContent = input.existingSegments
        .map(seg => `[${seg.startTime}s - ${seg.endTime}s] ${seg.text}`)
        .join('\n');
    } else if (input.text) {
      textContent = input.text;
    } else {
      throw new Error('Text or existingSegments must be provided for text-based diarization');
    }

    // Build the prompt for text-based diarization
    const prompt = this.buildTextDiarizationPrompt(textContent, options);

    // Call Gemini API
    const result = await this.model.generateContent([{ text: prompt }]);
    const response = result.response;
    const responseText = response.text();

    // Parse the response
    const diarizationResult = this.parseDiarizationResponse(responseText);

    // Apply speaker mapping if provided
    const mappedResult = this.applySpeakerMapping(diarizationResult, options.speakerMapping);

    logger.info('Text-based diarization completed');
    return mappedResult;
  }

  /**
   * Build the diarization prompt for audio input
   */
  private buildDiarizationPrompt(options: DiarizationOptions): string {
    const languageHint = options.language ? `The audio is in ${options.language}.` : '';
    const minConfidence = options.minConfidence ?? 0.5;

    return `
Perform speaker diarization on this audio file. Identify "Who spoke when" with precise timestamps.

${languageHint}

Analyze the audio and identify different speakers. Label them as "Speaker 1", "Speaker 2", etc. based on the order they first appear.

Return the diarization in the following JSON format:
{
  "segments": [
    {
      "startTime": 0.0,
      "endTime": 5.5,
      "text": "The transcribed text for this segment",
      "speaker": "Speaker 1",
      "confidence": 0.95
    }
  ],
  "speakers": ["Speaker 1", "Speaker 2"],
  "duration": 120.5
}

Rules:
- startTime and endTime are in seconds with decimal precision
- confidence is a value between 0 and 1 indicating speaker identification certainty
- Only assign speaker labels if confidence >= ${minConfidence}
- If speaker cannot be identified with sufficient confidence, use "Unknown" as the speaker
- Ensure all timestamps are present, sequential, and non-overlapping
- Include transcribed text for each segment
- Return ONLY valid JSON, no additional text or markdown
`.trim();
  }

  /**
   * Build the diarization prompt for text input
   */
  private buildTextDiarizationPrompt(textContent: string, options: DiarizationOptions): string {
    const languageHint = options.language ? `The text is in ${options.language}.` : '';
    const minConfidence = options.minConfidence ?? 0.5;

    return `
Perform speaker diarization on the following text. Identify "Who spoke when" based on the content and context.

${languageHint}

Text content:
${textContent}

Analyze the text and identify different speakers. Label them as "Speaker 1", "Speaker 2", etc. based on the order they first appear. Use the timestamps provided in the text if available.

Return the diarization in the following JSON format:
{
  "segments": [
    {
      "startTime": 0.0,
      "endTime": 5.5,
      "text": "The text for this segment",
      "speaker": "Speaker 1",
      "confidence": 0.95
    }
  ],
  "speakers": ["Speaker 1", "Speaker 2"],
  "duration": 120.5
}

Rules:
- startTime and endTime are in seconds with decimal precision
- If timestamps are provided in the text, use them; otherwise estimate based on text length
- confidence is a value between 0 and 1 indicating speaker identification certainty
- Only assign speaker labels if confidence >= ${minConfidence}
- If speaker cannot be identified with sufficient confidence, use "Unknown" as the speaker
- Ensure all timestamps are present and sequential
- Return ONLY valid JSON, no additional text or markdown
`.trim();
  }

  /**
   * Parse Gemini response into DiarizationResult
   */
  parseDiarizationResponse(responseText: string): DiarizationResult {
    try {
      // Handle empty or whitespace-only input
      if (!responseText || !responseText.trim()) {
        logger.warn('Empty response from Gemini, returning empty result');
        return {
          segments: [],
          speakers: [],
          duration: 0,
        };
      }

      // Extract JSON from response (handle potential markdown code blocks)
      let jsonStr = responseText.trim();
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      // Remove any leading/trailing non-JSON text
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(jsonStr);

      // Validate and normalize the response
      const result: DiarizationResult = {
        segments: this.normalizeSegments(parsed.segments || []),
        speakers: this.extractUniqueSpeakers(parsed.segments || []),
        duration: Math.max(0, Number(parsed.duration) || 0),
      };

      // Validate timestamps
      this.validateTimestamps(result.segments);

      return result;
    } catch (error) {
      logger.error('Error parsing diarization response:', error);
      // Return a safe fallback result
      return {
        segments: [],
        speakers: [],
        duration: 0,
      };
    }
  }

  /**
   * Normalize segments to ensure consistent structure
   */
  private normalizeSegments(segments: unknown[]): DiarizedSegment[] {
    if (!Array.isArray(segments)) {
      return [];
    }

    return segments
      .filter(seg => seg !== null && typeof seg === 'object')
      .map((seg: unknown, index: number) => {
        const segment = seg as Record<string, unknown>;
        return {
          startTime: Math.max(0, Number(segment.startTime) || 0),
          endTime: Math.max(0, Number(segment.endTime) || 0),
          text: String(segment.text || '').trim(),
          speaker: segment.speaker ? String(segment.speaker) : 'Unknown',
          confidence: Math.min(1, Math.max(0, Number(segment.confidence) || 0.5)),
        };
      })
      .filter(seg => seg.text.length > 0); // Remove empty segments
  }

  /**
   * Extract unique speakers from segments
   */
  private extractUniqueSpeakers(segments: unknown[]): string[] {
    if (!Array.isArray(segments)) {
      return [];
    }

    const speakerSet = new Set<string>();
    segments.forEach((seg: unknown) => {
      if (seg && typeof seg === 'object') {
        const segment = seg as Record<string, unknown>;
        const speaker = segment.speaker;
        if (speaker && typeof speaker === 'string') {
          speakerSet.add(speaker);
        }
      }
    });

    return Array.from(speakerSet).sort();
  }

  /**
   * Apply speaker name mapping (e.g., "Speaker 1" -> "Professor")
   */
  private applySpeakerMapping(
    result: DiarizationResult,
    mapping?: Record<string, string>
  ): DiarizationResult {
    if (!mapping || Object.keys(mapping).length === 0) {
      return result;
    }

    // Create a normalized mapping (handle variations like "Speaker 1", "Speaker_1", "speaker 1")
    const normalizedMapping = new Map<string, string>();
    Object.entries(mapping).forEach(([key, value]) => {
      const normalizedKey = this.normalizeSpeakerLabel(key);
      normalizedMapping.set(normalizedKey, value);
    });

    // Apply mapping to segments
    const mappedSegments = result.segments.map(segment => {
      const normalizedSpeaker = this.normalizeSpeakerLabel(segment.speaker);
      const mappedName = normalizedMapping.get(normalizedSpeaker);
      
      return {
        ...segment,
        speaker: mappedName || segment.speaker,
      };
    });

    // Update speakers list
    const mappedSpeakers = result.speakers.map(speaker => {
      const normalizedSpeaker = this.normalizeSpeakerLabel(speaker);
      const mappedName = normalizedMapping.get(normalizedSpeaker);
      return mappedName || speaker;
    });

    return {
      ...result,
      segments: mappedSegments,
      speakers: [...new Set(mappedSpeakers)], // Remove duplicates
      speakerMapping: mapping,
    };
  }

  /**
   * Normalize speaker label for consistent matching
   * Handles variations like "Speaker 1", "Speaker_1", "speaker 1", etc.
   */
  private normalizeSpeakerLabel(label: string): string {
    return label
      .toLowerCase()
      .trim()
      .replace(/[_\s]+/g, ' ')
      .replace(/^speaker\s*/, 'speaker ')
      .trim();
  }

  /**
   * Validate that all segments have valid timestamps
   */
  private validateTimestamps(segments: DiarizedSegment[]): void {
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      
      // Ensure startTime <= endTime
      if (segment.startTime > segment.endTime) {
        logger.warn(`Segment ${i} has invalid timestamps: start (${segment.startTime}) > end (${segment.endTime})`);
        // Fix by swapping if needed
        [segment.startTime, segment.endTime] = [segment.endTime, segment.startTime];
      }

      // Ensure non-negative timestamps
      if (segment.startTime < 0) {
        logger.warn(`Segment ${i} has negative startTime: ${segment.startTime}`);
        segment.startTime = 0;
      }
      if (segment.endTime < 0) {
        logger.warn(`Segment ${i} has negative endTime: ${segment.endTime}`);
        segment.endTime = 0;
      }
    }

    // Sort segments by startTime to ensure chronological order
    segments.sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Validate input parameters
   */
  private validateInput(input: DiarizationInput): void {
    if (!input.audioPath && !input.text && (!input.existingSegments || input.existingSegments.length === 0)) {
      throw new Error('At least one of audioPath, text, or existingSegments must be provided');
    }

    if (input.existingSegments) {
      // Validate existing segments structure
      for (const seg of input.existingSegments) {
        if (typeof seg.startTime !== 'number' || typeof seg.endTime !== 'number') {
          throw new Error('Existing segments must have numeric startTime and endTime');
        }
        if (seg.startTime < 0 || seg.endTime < 0) {
          throw new Error('Existing segments must have non-negative timestamps');
        }
        if (seg.startTime > seg.endTime) {
          throw new Error('Existing segments must have startTime <= endTime');
        }
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

export const diarizationService = new DiarizationService();

