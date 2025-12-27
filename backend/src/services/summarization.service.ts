import { gemini } from '@/config/gemini';
import { logger } from '@/config/logger';
import { summaryRepository } from '@/repositories/summary.repository';
import { transcriptRepository } from '@/repositories/transcript.repository';
import { SummarizationOptions, SummaryResult } from '@/types/summarization.types';

export class SummarizationService {
  private model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * Generate a summary for a recording based on its transcript
   */
  async generateSummary(
    recordingId: string,
    options: SummarizationOptions = {}
  ): Promise<SummaryResult> {
    try {
      logger.info(`Starting summarization for recording: ${recordingId}`);

      // 1. Fetch transcript
      const transcript = await transcriptRepository.findByRecordingId(recordingId);
      if (!transcript) {
        throw new Error(`Transcript not found for recording: ${recordingId}`);
      }

      // 2. Prepare text for summarization
      // Use the full text if available, otherwise potentially use segments
      const textToSummarize = transcript.fullText;

      if (!textToSummarize) {
        throw new Error(`No text content found in transcript for recording: ${recordingId}`);
      }

      // 3. Build prompt
      const prompt = this.buildSummarizationPrompt(textToSummarize, options);

      // 4. Call Gemini API
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text();

      // 5. Parse response
      const summaryResult = this.parseSummaryResponse(responseText);

      // 6. Save to database
      await summaryRepository.create({
        recordingId,
        content: summaryResult.overview,
        sections: summaryResult.sections,
        keyPoints: summaryResult.keyTakeaways,
      });

      logger.info(`Summarization completed for recording: ${recordingId}`);
      return summaryResult;
    } catch (error) {
      logger.error(`Error generating summary for recording ${recordingId}:`, error);
      throw error;
    }
  }

  /**
   * Build the summarization prompt
   */
  private buildSummarizationPrompt(text: string, options: SummarizationOptions): string {
    const lengthInstruction =
      options.length === 'short'
        ? 'Keep the summary very concise (approx 10% of original length).'
        : options.length === 'long'
          ? 'Provide a detailed summary (approx 30% of original length).'
          : 'Provide a balanced summary (approx 20% of original length).';

    return `
You are an expert lecture summarizer. Your task is to analyze the following transcript and provide a structured summary.
${lengthInstruction}

Transcript:
"""
${text}
"""

Return the summary in the following JSON format:
{
  "overview": "A brief 2-3 sentence overview of the entire lecture.",
  "sections": [
    {
      "heading": "Section Heading",
      "content": "Paragraph summary of this section.",
      "bulletPoints": ["Key point 1", "Key point 2"]
    }
  ],
  "keyTakeaways": ["Major takeaway 1", "Major takeaway 2", "Major takeaway 3"],
  "speakerAttributions": [
     {
       "statement": "Key statement made",
       "speaker": "Speaker Label (if available in text, else generic)",
       "context": "Context of the statement"
     }
  ]
}

Rules:
- "sections" should cover the logical flow of the lecture.
- "keyTakeaways" should be high-level insights.
- "speakerAttributions" (optional): include only if there are distinct, notable statements attributed to specific speakers or roles in the text.
- Ensure the JSON is valid and can be parsed.
`.trim();
  }

  /**
   * Parse Gemini response into SummaryResult
   */
  parseSummaryResponse(responseText: string): SummaryResult {
    try {
      let jsonStr = responseText;
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);

      // Basic validation/normalization
      return {
        overview: parsed.overview || '',
        sections: Array.isArray(parsed.sections) ? parsed.sections : [],
        keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [],
        speakerAttributions: Array.isArray(parsed.speakerAttributions)
          ? parsed.speakerAttributions
          : [],
      };
    } catch (error) {
      logger.error('Error parsing summary response:', error);
      // Fallback
      return {
        overview: responseText,
        sections: [],
        keyTakeaways: [],
        speakerAttributions: [],
      };
    }
  }
}

export const summarizationService = new SummarizationService();
