/**
 * Tests for the Summarization Service
 *
 * The summarization service uses Gemini API for text analysis.
 */
import { summarizationService } from './summarization.service';

// Mock the Gemini client
jest.mock('@/config/gemini', () => ({
  gemini: {
    models: {
      generateContent: jest.fn(),
    },
  },
}));

// Mock the repositories
jest.mock('@/repositories/transcript.repository', () => ({
  transcriptRepository: {
    findByRecordingId: jest.fn(),
  },
}));

jest.mock('@/repositories/summary.repository', () => ({
  summaryRepository: {
    create: jest.fn(),
  },
}));

import { gemini } from '@/config/gemini';
import { summaryRepository } from '@/repositories/summary.repository';
import { transcriptRepository } from '@/repositories/transcript.repository';

describe('SummarizationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSummary', () => {
    it('should generate summary from transcript', async () => {
      const mockTranscript = {
        id: 'transcript-1',
        recordingId: 'recording-1',
        fullText:
          'This is a lecture about machine learning. It covers neural networks and deep learning.',
      };

      const mockGeminiResponse = {
        text: JSON.stringify({
          overview: 'A lecture about machine learning concepts.',
          sections: [
            {
              heading: 'Introduction',
              content: 'Overview of ML',
              bulletPoints: ['Neural networks', 'Deep learning'],
            },
          ],
          keyTakeaways: ['ML is powerful', 'Neural networks are key'],
          speakerAttributions: [],
        }),
      };

      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
      (gemini.models.generateContent as jest.Mock).mockResolvedValue(mockGeminiResponse);
      (summaryRepository.create as jest.Mock).mockResolvedValue({});

      const result = await summarizationService.generateSummary('recording-1');

      expect(transcriptRepository.findByRecordingId).toHaveBeenCalledWith('recording-1');
      expect(gemini.models.generateContent).toHaveBeenCalled();
      expect(summaryRepository.create).toHaveBeenCalled();
      expect(result.overview).toBe('A lecture about machine learning concepts.');
    });

    it('should throw error when transcript not found', async () => {
      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(null);

      await expect(summarizationService.generateSummary('nonexistent')).rejects.toThrow(
        'Transcript not found'
      );
    });

    it('should handle Gemini response with markdown code blocks', async () => {
      const mockTranscript = {
        id: 'transcript-1',
        recordingId: 'recording-1',
        fullText: 'Test transcript',
      };

      const mockGeminiResponse = {
        text: '```json\n{"overview": "Test overview", "sections": [], "keyTakeaways": [], "speakerAttributions": []}\n```',
      };

      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
      (gemini.models.generateContent as jest.Mock).mockResolvedValue(mockGeminiResponse);
      (summaryRepository.create as jest.Mock).mockResolvedValue({});

      const result = await summarizationService.generateSummary('recording-1');

      expect(result.overview).toBe('Test overview');
    });
  });

  describe('parseSummaryResponse', () => {
    it('should parse valid JSON response', () => {
      const response = JSON.stringify({
        overview: 'Test overview',
        sections: [{ heading: 'Test', content: 'Content', bulletPoints: [] }],
        keyTakeaways: ['Point 1'],
        speakerAttributions: [],
      });

      const result = summarizationService.parseSummaryResponse(response);

      expect(result.overview).toBe('Test overview');
      expect(result.sections).toHaveLength(1);
      expect(result.keyTakeaways).toHaveLength(1);
    });

    it('should return fallback for invalid JSON', () => {
      const result = summarizationService.parseSummaryResponse('invalid json');

      expect(result.overview).toBe('invalid json');
      expect(result.sections).toHaveLength(0);
    });
  });
});
