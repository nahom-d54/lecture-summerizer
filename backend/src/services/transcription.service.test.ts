/**
 * Tests for the Transcription Service
 *
 * Note: The transcription service now calls the Python Whisper service.
 * These tests mock the HTTP calls to the Python service.
 */
import { transcriptionService } from './transcription.service';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock the repositories
jest.mock('@/repositories/transcript.repository', () => ({
  transcriptRepository: {
    create: jest.fn(),
    findByRecordingId: jest.fn(),
    getLowConfidenceSegments: jest.fn(),
  },
}));

jest.mock('@/services/storage.service', () => ({
  storageService: {
    getFilePath: jest.fn((path: string) => `/uploads/${path}`),
  },
}));

describe('TranscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('transcribeAudio', () => {
    it('should call Python transcription service and return result', async () => {
      const mockResponse = {
        success: true,
        language: 'en',
        duration: 120.5,
        text: 'Hello world, this is a test transcription.',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await transcriptionService.transcribeAudio('/path/to/audio.mp3');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/transcribe-path'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(result.fullText).toBe('Hello world, this is a test transcription.');
      expect(result.duration).toBe(120.5);
    });

    it('should handle diarization response with segments', async () => {
      const mockResponse = {
        success: true,
        language: 'en',
        duration: 60.0,
        text: 'Speaker A says hello. Speaker B responds.',
        segments: [
          { speaker: 'Speaker A', start: 0, end: 3.5, text: 'Speaker A says hello.' },
          { speaker: 'Speaker B', start: 3.5, end: 6.0, text: 'Speaker B responds.' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await transcriptionService.transcribeAudio('/path/to/audio.mp3', {
        enableSpeakerDiarization: true,
      });

      expect(result.segments).toHaveLength(2);
      expect(result.speakers).toContain('Speaker A');
      expect(result.speakers).toContain('Speaker B');
    });

    it('should throw error when transcription service fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(transcriptionService.transcribeAudio('/path/to/audio.mp3')).rejects.toThrow(
        'Transcription service error'
      );
    });

    it('should throw error when transcription returns failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'File not found',
        }),
      });

      await expect(transcriptionService.transcribeAudio('/path/to/audio.mp3')).rejects.toThrow(
        'File not found'
      );
    });
  });

  describe('checkHealth', () => {
    it('should return true when service is healthy', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const result = await transcriptionService.checkHealth();
      expect(result).toBe(true);
    });

    it('should return false when service is unavailable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await transcriptionService.checkHealth();
      expect(result).toBe(false);
    });
  });
});
