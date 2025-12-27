import * as fc from 'fast-check';
import { gemini } from '@/config/gemini';
import { summaryRepository } from '@/repositories/summary.repository';
import { transcriptRepository } from '@/repositories/transcript.repository';
import { SummaryResult } from '@/types/summarization.types';
import { SummarizationService } from './summarization.service';

// Mock dependencies
jest.mock('@/repositories/transcript.repository');
jest.mock('@/repositories/summary.repository');
jest.mock('@/config/gemini');
jest.mock('@/config/logger');

describe('SummarizationService', () => {
  let service: SummarizationService;
  let mockGenerateContent: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock for Gemini
    mockGenerateContent = jest.fn();
    (gemini.getGenerativeModel as jest.Mock).mockReturnValue({
      generateContent: mockGenerateContent,
    });

    service = new SummarizationService();
  });

  const mockRecordingId = 'test-recording-id';
  const mockTranscript = {
    id: 'transcript-id',
    recordingId: mockRecordingId,
    fullText: 'This is a test lecture transcript. It contains some content about computer science.',
    segments: [],
    speakers: ['Speaker 1', 'Speaker 2'],
    duration: 100,
    createdAt: new Date(),
  };

  const mockGeminiResponse = {
    response: {
      text: () =>
        JSON.stringify({
          overview: 'Test overview',
          sections: [
            {
              heading: 'Introduction',
              content: 'Intro content',
              bulletPoints: ['Point 1'],
            },
          ],
          keyTakeaways: ['Takeaway 1'],
          speakerAttributions: [
            {
              statement: 'Key statement',
              speaker: 'Speaker 1',
              context: 'During introduction',
            },
          ],
        }),
    },
  };

  test('should generate summary successfully', async () => {
    // Mock valid transcript found
    (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);

    // Mock successful Gemini response
    mockGenerateContent.mockResolvedValue(mockGeminiResponse);

    const result = await service.generateSummary(mockRecordingId);

    // Verify transcript was fetched
    expect(transcriptRepository.findByRecordingId).toHaveBeenCalledWith(mockRecordingId);

    // Verify Gemini was called
    expect(mockGenerateContent).toHaveBeenCalled();
    // Check if prompt was passed (checking first arg of first call)
    const prompt = mockGenerateContent.mock.calls[0][0];
    expect(prompt).toContain(mockTranscript.fullText);

    // Verify repository create was called
    expect(summaryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        recordingId: mockRecordingId,
        content: 'Test overview',
      })
    );

    // Verify result structure
    expect(result).toHaveProperty('overview');
    expect(result).toHaveProperty('sections');
    expect(result).toHaveProperty('keyTakeaways');
  });

  test('should handle missing transcript', async () => {
    (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(null);

    await expect(service.generateSummary(mockRecordingId)).rejects.toThrow(
      `Transcript not found for recording: ${mockRecordingId}`
    );

    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  test('should handle JSON parsing error from Gemini', async () => {
    (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);

    // Return non-JSON text
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'This is not JSON.',
      },
    });

    const result = await service.generateSummary(mockRecordingId);

    // Should return fallback with raw text as overview
    expect(result.overview).toBe('This is not JSON.');
    expect(result.sections).toEqual([]);
  });

  describe('Property 9: Summary length constraint', () => {
    test('Prompt includes correct length instruction for short summaries', async () => {
      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
      mockGenerateContent.mockResolvedValue(mockGeminiResponse);

      await service.generateSummary(mockRecordingId, { length: 'short' });
      const prompt = mockGenerateContent.mock.calls[0][0];
      expect(prompt).toContain('approx 10% of original length');
    });

    test('Prompt includes correct length instruction for medium summaries', async () => {
      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
      mockGenerateContent.mockResolvedValue(mockGeminiResponse);

      await service.generateSummary(mockRecordingId, { length: 'medium' });
      const prompt = mockGenerateContent.mock.calls[0][0];
      expect(prompt).toContain('approx 20% of original length');
    });

    test('Prompt includes correct length instruction for long summaries', async () => {
      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
      mockGenerateContent.mockResolvedValue(mockGeminiResponse);

      await service.generateSummary(mockRecordingId, { length: 'long' });
      const prompt = mockGenerateContent.mock.calls[0][0];
      expect(prompt).toContain('approx 30% of original length');
    });

    test('Default length is medium (20%)', async () => {
      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
      mockGenerateContent.mockResolvedValue(mockGeminiResponse);

      await service.generateSummary(mockRecordingId); // No options
      const prompt = mockGenerateContent.mock.calls[0][0];
      expect(prompt).toContain('approx 20% of original length');
    });

    test('Property: Length constraint is always included in prompt', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('short', 'medium', 'long', undefined),
          fc.string({ minLength: 10, maxLength: 1000 }),
          (length, text) => {
            const prompt = (service as any).buildSummarizationPrompt(text, { length });
            // Should always contain a length instruction
            return (
              prompt.includes('10% of original length') ||
              prompt.includes('20% of original length') ||
              prompt.includes('30% of original length')
            );
          }
        )
      );
    });
  });

  describe('Property 10: Speaker attribution validity', () => {
    test('Speaker attributions are parsed correctly from response', async () => {
      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
      mockGenerateContent.mockResolvedValue(mockGeminiResponse);

      const result = await service.generateSummary(mockRecordingId);

      expect(result.speakerAttributions).toBeDefined();
      expect(result.speakerAttributions).toHaveLength(1);
      expect(result.speakerAttributions![0]).toEqual({
        statement: 'Key statement',
        speaker: 'Speaker 1',
        context: 'During introduction',
      });
    });

    test('Speaker attributions default to empty array when not provided', async () => {
      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              overview: 'Test',
              sections: [],
              keyTakeaways: [],
              // No speakerAttributions
            }),
        },
      });

      const result = await service.generateSummary(mockRecordingId);
      expect(result.speakerAttributions).toEqual([]);
    });

    test('Property: Parsed speaker attributions always have required fields', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              statement: fc.string(),
              speaker: fc.string(),
              context: fc.string(),
            }),
            { maxLength: 10 }
          ),
          attributions => {
            const jsonResponse = JSON.stringify({
              overview: 'Test',
              sections: [],
              keyTakeaways: [],
              speakerAttributions: attributions,
            });

            const result = service.parseSummaryResponse(jsonResponse);

            // All attributions should be preserved
            if (result.speakerAttributions) {
              return result.speakerAttributions.length === attributions.length;
            }
            return attributions.length === 0;
          }
        )
      );
    });

    test('Property: Speaker attributions are always an array', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant('not an array'),
            fc.array(
              fc.record({ statement: fc.string(), speaker: fc.string(), context: fc.string() })
            )
          ),
          attributions => {
            const jsonResponse = JSON.stringify({
              overview: 'Test',
              sections: [],
              keyTakeaways: [],
              speakerAttributions: attributions,
            });

            const result = service.parseSummaryResponse(jsonResponse);

            // Should always be an array
            return Array.isArray(result.speakerAttributions);
          }
        )
      );
    });

    test('Prompt requests speaker attributions', async () => {
      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
      mockGenerateContent.mockResolvedValue(mockGeminiResponse);

      await service.generateSummary(mockRecordingId);
      const prompt = mockGenerateContent.mock.calls[0][0];

      expect(prompt).toContain('speakerAttributions');
      expect(prompt).toContain('statement');
      expect(prompt).toContain('speaker');
      expect(prompt).toContain('context');
    });
  });

  describe('Response parsing robustness', () => {
    test('Property: Parsing always returns valid SummaryResult structure', () => {
      fc.assert(
        fc.property(fc.string(), randomText => {
          const result = service.parseSummaryResponse(randomText);

          // Should always have required fields
          return (
            typeof result.overview === 'string' &&
            Array.isArray(result.sections) &&
            Array.isArray(result.keyTakeaways) &&
            (result.speakerAttributions === undefined || Array.isArray(result.speakerAttributions))
          );
        })
      );
    });

    test('Handles JSON in markdown code blocks', () => {
      const wrappedJson = '```json\n{"overview":"Test","sections":[],"keyTakeaways":[]}\n```';
      const result = service.parseSummaryResponse(wrappedJson);
      expect(result.overview).toBe('Test');
    });
  });
});
