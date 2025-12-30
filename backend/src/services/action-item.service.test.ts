/**
 * Tests for the Action Item Service
 *
 * The action item service uses Gemini API for extracting action items from transcripts.
 */
import { actionItemService } from './action-item.service';

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

jest.mock('@/repositories/action-item.repository', () => ({
  actionItemRepository: {
    createMany: jest.fn(),
    findByRecordingId: jest.fn(),
    update: jest.fn(),
  },
}));

import { gemini } from '@/config/gemini';
import { actionItemRepository } from '@/repositories/action-item.repository';
import { transcriptRepository } from '@/repositories/transcript.repository';

describe('ActionItemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateActionItems', () => {
    it('should extract action items from transcript', async () => {
      const mockTranscript = {
        id: 'transcript-1',
        recordingId: 'recording-1',
        fullText: 'John needs to send the report by Friday. Sarah will review it.',
        segments: [],
      };

      const mockGeminiResponse = {
        text: JSON.stringify([
          {
            description: 'Send the report',
            assignee: 'John',
            deadline: '2024-01-05',
            quote: 'John needs to send the report',
          },
          {
            description: 'Review the report',
            assignee: 'Sarah',
            deadline: null,
            quote: 'Sarah will review it',
          },
        ]),
      };

      const mockCreatedItems = [
        { id: '1', description: 'Send the report', assignee: 'John' },
        { id: '2', description: 'Review the report', assignee: 'Sarah' },
      ];

      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
      (gemini.models.generateContent as jest.Mock).mockResolvedValue(mockGeminiResponse);
      (actionItemRepository.createMany as jest.Mock).mockResolvedValue({});
      (actionItemRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockCreatedItems);

      const result = await actionItemService.generateActionItems('recording-1');

      expect(transcriptRepository.findByRecordingId).toHaveBeenCalledWith('recording-1');
      expect(gemini.models.generateContent).toHaveBeenCalled();
      expect(actionItemRepository.createMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should throw error when transcript not found', async () => {
      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(null);

      await expect(actionItemService.generateActionItems('nonexistent')).rejects.toThrow(
        'Transcript not found'
      );
    });

    it('should return empty array when no action items found', async () => {
      const mockTranscript = {
        id: 'transcript-1',
        recordingId: 'recording-1',
        fullText: 'This is just a general discussion with no tasks.',
        segments: [],
      };

      (transcriptRepository.findByRecordingId as jest.Mock).mockResolvedValue(mockTranscript);
      (gemini.models.generateContent as jest.Mock).mockResolvedValue({ text: '[]' });

      const result = await actionItemService.generateActionItems('recording-1');

      expect(result).toEqual([]);
    });
  });

  describe('updateActionItem', () => {
    it('should update action item', async () => {
      const mockUpdated = { id: '1', completed: true };
      (actionItemRepository.update as jest.Mock).mockResolvedValue(mockUpdated);

      const result = await actionItemService.updateActionItem('1', { completed: true });

      expect(actionItemRepository.update).toHaveBeenCalledWith('1', { completed: true });
      expect(result.completed).toBe(true);
    });
  });
});
