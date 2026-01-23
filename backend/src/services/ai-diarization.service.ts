import { logger } from '@/config/logger';
import { MODEL_NAME, openai } from '@/config/openai';

interface TranscriptSegment {
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
  confidence: number;
}

interface DiarizedSegment {
  startTime: number;
  endTime: number;
  text: string;
  speaker: string;
  confidence: number;
}

export class AIDiarizationService {
  /**
   * Use AI to identify speakers in a transcript based on context
   */
  async diarizeTranscript(segments: TranscriptSegment[]): Promise<DiarizedSegment[]> {
    try {
      logger.info('Starting AI-based speaker diarization...');

      // Combine segments into a single text with timestamps for context
      const transcriptText = segments.map((seg, idx) => `[${idx}] ${seg.text}`).join('\n');

      const prompt = `Analyze this transcript and identify different speakers based on context, conversation flow, and content.
Assign speaker labels (Speaker A, Speaker B, etc.) to each segment.

Rules:
1. Use context clues like questions/answers, topic changes, speaking style
2. Be consistent - same person should have same label throughout
3. If you detect 1 speaker, label all as "Speaker A"
4. Return ONLY valid JSON, no markdown

Transcript:
${transcriptText}

Return JSON array with format:
[
  {"index": 0, "speaker": "Speaker A"},
  {"index": 1, "speaker": "Speaker B"},
  ...
]`;

      const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert at analyzing conversations and identifying different speakers based on context, tone, and content. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const responseText = response.choices[0]?.message?.content || '';
      const speakerAssignments = this.parseResponse(responseText);

      // Apply speaker labels to segments
      const diarizedSegments: DiarizedSegment[] = segments.map((seg, idx) => {
        const assignment = speakerAssignments.find(a => a.index === idx);
        return {
          startTime: seg.startTime,
          endTime: seg.endTime,
          text: seg.text,
          speaker: assignment?.speaker || 'Speaker A',
          confidence: seg.confidence,
        };
      });

      // Log speaker distribution
      const speakers = new Set(diarizedSegments.map(s => s.speaker));
      logger.info(`AI diarization complete: ${speakers.size} speakers detected`);

      return diarizedSegments;
    } catch (error) {
      logger.error('AI diarization failed:', error);
      // Fallback: assign all to Speaker A
      return segments.map(seg => ({
        startTime: seg.startTime,
        endTime: seg.endTime,
        text: seg.text,
        speaker: 'Speaker A',
        confidence: seg.confidence,
      }));
    }
  }

  private parseResponse(text: string): Array<{ index: number; speaker: string }> {
    try {
      // Remove markdown code blocks if present
      let jsonStr = text;
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        jsonStr = match[1].trim();
      }

      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      logger.warn('Failed to parse AI diarization response', error);
      return [];
    }
  }
}

export const aiDiarizationService = new AIDiarizationService();
