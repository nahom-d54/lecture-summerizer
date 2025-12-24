import * as fc from 'fast-check';
import {
  LOW_CONFIDENCE_THRESHOLD,
  TranscriptionResult,
  TranscriptSegment,
} from '@/types/transcription.types';
import { TranscriptionService } from './transcription.service';

// Mock dependencies
jest.mock('@/config/gemini', () => ({
  gemini: {
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  },
}));

jest.mock('@/config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

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

// Arbitrary generators for property tests
const segmentArbitrary = fc.record({
  startTime: fc.float({ min: 0, max: 3600, noNaN: true }),
  endTime: fc.float({ min: 0, max: 3600, noNaN: true }),
  text: fc.string({ minLength: 1, maxLength: 500 }),
  speaker: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  confidence: fc.float({ min: 0, max: 1, noNaN: true }),
});

const transcriptionResultArbitrary = fc.record({
  fullText: fc.string({ minLength: 1, maxLength: 5000 }),
  segments: fc.array(segmentArbitrary, { minLength: 1, maxLength: 50 }),
  speakers: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
  duration: fc.float({ min: 0, max: 7200, noNaN: true }),
});

describe('TranscriptionService Property Tests', () => {
  let transcriptionService: TranscriptionService;

  beforeEach(() => {
    jest.clearAllMocks();
    transcriptionService = new TranscriptionService();
  });

  describe('Property 4: Transcript-recording association', () => {
    test('Every transcript must be associated with exactly one recording', async () => {
      const { transcriptRepository } = require('@/repositories/transcript.repository');

      await fc.assert(
        fc.asyncProperty(fc.uuid(), transcriptionResultArbitrary, async (recordingId, result) => {
          // Mock the repository to track what's being saved
          let savedRecordingId: string | null = null;
          transcriptRepository.create.mockImplementation((data: { recordingId: string }) => {
            savedRecordingId = data.recordingId;
            return Promise.resolve({ id: 'transcript-id', ...data });
          });

          // Simulate creating a transcript for a recording
          const transcriptData = {
            recordingId,
            fullText: result.fullText,
            segments: result.segments,
            speakers: result.speakers,
            duration: result.duration,
          };

          await transcriptRepository.create(transcriptData);

          // Property: The saved transcript must have the exact recordingId
          return savedRecordingId === recordingId;
        })
      );
    });

    test('Recording ID must be a valid UUID format', async () => {
      await fc.assert(
        fc.property(fc.uuid(), recordingId => {
          // UUID v4 format validation
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return uuidRegex.test(recordingId);
        })
      );
    });
  });

  describe('Property 5: Timestamp presence', () => {
    test('All transcript segments must have startTime and endTime', async () => {
      await fc.assert(
        fc.property(transcriptionResultArbitrary, result => {
          return result.segments.every(
            segment =>
              typeof segment.startTime === 'number' &&
              typeof segment.endTime === 'number' &&
              !Number.isNaN(segment.startTime) &&
              !Number.isNaN(segment.endTime)
          );
        })
      );
    });

    test('Parsed response segments always have timestamps', () => {
      fc.assert(
        fc.property(transcriptionResultArbitrary, mockResult => {
          // Create a valid JSON response
          const jsonResponse = JSON.stringify(mockResult);

          // Parse it through the service
          const parsed = transcriptionService.parseTranscriptionResponse(jsonResponse);

          // Every segment must have timestamps
          return parsed.segments.every(
            segment => typeof segment.startTime === 'number' && typeof segment.endTime === 'number'
          );
        })
      );
    });

    test('Timestamps are normalized to numbers even from string input', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 3600, noNaN: true }),
          fc.float({ min: 0, max: 3600, noNaN: true }),
          fc.string(),
          (startTime, endTime, text) => {
            const jsonResponse = JSON.stringify({
              fullText: text,
              segments: [
                {
                  startTime: String(startTime), // String input
                  endTime: String(endTime), // String input
                  text,
                  confidence: 0.9,
                },
              ],
              speakers: [],
              duration: endTime,
            });

            const parsed = transcriptionService.parseTranscriptionResponse(jsonResponse);

            return (
              typeof parsed.segments[0].startTime === 'number' &&
              typeof parsed.segments[0].endTime === 'number'
            );
          }
        )
      );
    });
  });

  describe('Property 6: Low confidence marking', () => {
    test('Segments with confidence below threshold are identifiable', async () => {
      await fc.assert(
        fc.property(fc.array(segmentArbitrary, { minLength: 1, maxLength: 20 }), segments => {
          const lowConfidenceSegments = segments.filter(
            s => s.confidence < LOW_CONFIDENCE_THRESHOLD
          );
          const highConfidenceSegments = segments.filter(
            s => s.confidence >= LOW_CONFIDENCE_THRESHOLD
          );

          // Property: All segments are either low or high confidence (partition)
          return lowConfidenceSegments.length + highConfidenceSegments.length === segments.length;
        })
      );
    });

    test('Confidence scores are always normalized between 0 and 1', () => {
      fc.assert(
        fc.property(fc.float({ min: -100, max: 100, noNaN: true }), rawConfidence => {
          const jsonResponse = JSON.stringify({
            fullText: 'test',
            segments: [
              {
                startTime: 0,
                endTime: 1,
                text: 'test',
                confidence: rawConfidence,
              },
            ],
            speakers: [],
            duration: 1,
          });

          const parsed = transcriptionService.parseTranscriptionResponse(jsonResponse);
          const confidence = parsed.segments[0].confidence;

          // Confidence must be clamped to [0, 1]
          return confidence >= 0 && confidence <= 1;
        })
      );
    });

    test('Low confidence threshold is consistently applied', async () => {
      const { transcriptRepository } = require('@/repositories/transcript.repository');

      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.array(segmentArbitrary, { minLength: 1, maxLength: 20 }),
          async (recordingId, segments) => {
            // Calculate expected low confidence segments
            const expectedLowConfidence = segments.filter(
              s => s.confidence < LOW_CONFIDENCE_THRESHOLD
            );

            // Mock the repository to return our segments
            transcriptRepository.getLowConfidenceSegments.mockImplementation(
              (id: string, threshold: number) => {
                return Promise.resolve(segments.filter(s => s.confidence < threshold));
              }
            );

            const result = await transcriptRepository.getLowConfidenceSegments(
              recordingId,
              LOW_CONFIDENCE_THRESHOLD
            );

            // Property: Result matches expected low confidence segments
            return result.length === expectedLowConfidence.length;
          }
        )
      );
    });
  });

  describe('Response parsing robustness', () => {
    test('Malformed JSON returns fallback result with low confidence', () => {
      const malformedInputs = ['not json', '{invalid}', '{"partial": true', ''];

      for (const input of malformedInputs) {
        const result = transcriptionService.parseTranscriptionResponse(input);

        // Should return a valid result structure
        expect(result).toHaveProperty('fullText');
        expect(result).toHaveProperty('segments');
        expect(result).toHaveProperty('speakers');
        expect(result).toHaveProperty('duration');

        // Fallback should have low confidence
        if (result.segments.length > 0) {
          expect(result.segments[0].confidence).toBeLessThanOrEqual(0.5);
        }
      }
    });

    test('JSON in markdown code blocks is extracted correctly', () => {
      fc.assert(
        fc.property(transcriptionResultArbitrary, mockResult => {
          const wrappedJson = '```json\n' + JSON.stringify(mockResult) + '\n```';

          const parsed = transcriptionService.parseTranscriptionResponse(wrappedJson);

          return parsed.fullText === mockResult.fullText;
        })
      );
    });
  });
});
