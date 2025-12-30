/**
 * Tests for the Diarization Service
 *
 * Note: The diarization service now calls the Python Whisper service.
 * These tests mock the HTTP calls to the Python service.
 */
import { diarizationService } from './diarization.service';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('DiarizationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('diarize', () => {
    it('should call Python service with diarization enabled', async () => {
      const mockResponse = {
        success: true,
        language: 'en',
        duration: 120.0,
        text: 'Full transcript text',
        segments: [
          { speaker: 'Speaker A', start: 0, end: 5.5, text: 'Hello everyone' },
          { speaker: 'Speaker B', start: 5.5, end: 10.0, text: 'Hi there' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await diarizationService.diarize({
        audioPath: '/path/to/audio.mp3',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/transcribe-path'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"enable_diarization":true'),
        })
      );

      expect(result.segments).toHaveLength(2);
      expect(result.speakers).toContain('Speaker A');
      expect(result.speakers).toContain('Speaker B');
      expect(result.duration).toBe(120.0);
    });

    it('should throw error when audioPath is not provided', async () => {
      await expect(diarizationService.diarize({ audioPath: '' })).rejects.toThrow(
        'audioPath is required'
      );
    });

    it('should throw error when service fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(diarizationService.diarize({ audioPath: '/path/to/audio.mp3' })).rejects.toThrow(
        'Diarization service error'
      );
    });

    it('should handle empty segments', async () => {
      const mockResponse = {
        success: true,
        language: 'en',
        duration: 0,
        text: '',
        segments: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await diarizationService.diarize({
        audioPath: '/path/to/audio.mp3',
      });

      expect(result.segments).toHaveLength(0);
      expect(result.speakers).toHaveLength(0);
    });
  });
});
