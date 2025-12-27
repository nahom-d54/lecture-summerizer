import { gemini } from '@/config/gemini';
import { summaryRepository } from '@/repositories/summary.repository';
import { transcriptRepository } from '@/repositories/transcript.repository';
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
    speakers: [],
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
          speakerAttributions: [],
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

  // Property Tests (mocked)
  test('Property: Summary length constraint instruction', async () => {
    (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
    mockGenerateContent.mockResolvedValue(mockGeminiResponse);

    // Short
    await service.generateSummary(mockRecordingId, { length: 'short' });
    let prompt = mockGenerateContent.mock.calls[0][0];
    expect(prompt).toContain('approx 10% of original length');

    // Long
    await service.generateSummary(mockRecordingId, { length: 'long' });
    prompt = mockGenerateContent.mock.calls[1][0];
    expect(prompt).toContain('approx 30% of original length');
  });
});
