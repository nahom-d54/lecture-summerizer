import { gemini } from '@/config/gemini';
import { actionItemRepository } from '@/repositories/action-item.repository';
import { transcriptRepository } from '@/repositories/transcript.repository';
import { ActionItemService } from './action-item.service';

jest.mock('@/repositories/transcript.repository');
jest.mock('@/repositories/action-item.repository');
jest.mock('@/config/gemini');
jest.mock('@/config/logger');

describe('ActionItemService', () => {
  let service: ActionItemService;
  let mockGenerateContent: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateContent = jest.fn();
    (gemini.getGenerativeModel as jest.Mock).mockReturnValue({
      generateContent: mockGenerateContent,
    });
    service = new ActionItemService();
  });

  const mockRecordingId = 'rec-123';
  const mockTranscript = {
    id: 't-1',
    recordingId: mockRecordingId,
    fullText: 'Alex needs to deploy the app by Friday.',
    segments: [{ startTime: 10, endTime: 15, text: 'Alex needs to deploy the app by Friday.' }],
  };

  const mockGeminiResponse = JSON.stringify([
    {
      description: 'Deploy the app',
      assignee: 'Alex',
      deadline: '2025-12-31',
      quote: 'Alex needs to deploy',
    },
  ]);

  describe('generateActionItems (Requirement 9.2)', () => {
    test('should extract items and map timestamps correctly', async () => {
      // Setup Mocks
      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
      mockGenerateContent.mockResolvedValue({ response: { text: () => mockGeminiResponse } });

      // Run
      await service.generateActionItems(mockRecordingId);

      // Verify DB Insert
      expect(actionItemRepository.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            recordingId: mockRecordingId,
            description: 'Deploy the app',
            assignee: 'Alex',
            segmentStartTime: 10,
          }),
        ])
      );
    });

    test('Property 11: Action item structure validation', async () => {
      // Simulating a response missing the description to see if code handles/validates it
      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
      mockGenerateContent.mockResolvedValue({
        response: { text: () => JSON.stringify([{ description: 'Simple Task' }]) },
      });

      await service.generateActionItems(mockRecordingId);

      expect(actionItemRepository.createMany).toHaveBeenCalledWith([
        expect.objectContaining({
          description: 'Simple Task',
          completed: false,
        }),
      ]);
    });
  });

  describe('updateActionItem (Requirement 9.4)', () => {
    test('Property 12: Action item completion toggle', async () => {
      const itemId = 'item-123';

      // Test 1: Mark as complete
      await service.updateActionItem(itemId, { completed: true });
      expect(actionItemRepository.update).toHaveBeenCalledWith(itemId, { completed: true });

      // Test 2: Mark as incomplete
      await service.updateActionItem(itemId, { completed: false });
      expect(actionItemRepository.update).toHaveBeenCalledWith(itemId, { completed: false });
    });
  });

  describe('Property 13: Transcript reference validity', () => {
    test('Action items should have valid segment references when quote matches', async () => {
      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
      mockGenerateContent.mockResolvedValue({ response: { text: () => mockGeminiResponse } });

      await service.generateActionItems(mockRecordingId);

      // Verify that segmentStartTime is set when quote matches a segment
      expect(actionItemRepository.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            segmentStartTime: 10, // Should match the segment's startTime
          }),
        ])
      );
    });

    test('Action items should have null segment reference when no quote match', async () => {
      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify([
              { description: 'Unmatched task', quote: 'This text does not exist in transcript' },
            ]),
        },
      });

      await service.generateActionItems(mockRecordingId);

      expect(actionItemRepository.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            segmentStartTime: null,
          }),
        ])
      );
    });
  });
});
