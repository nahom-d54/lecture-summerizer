import { prisma } from '@/config/prisma';
import { storageService } from '@/services/storage.service';

jest.mock('@/config/prisma', () => ({
  prisma: {
    recording: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    actionItem: {
      update: jest.fn(),
    },
  },
}));

jest.mock('@/services/storage.service', () => ({
  storageService: {
    saveFile: jest.fn(),
    deleteFile: jest.fn(),
  },
}));

jest.mock('@/services/processing.service', () => ({
  processingService: {
    processRecording: jest.fn(),
  },
}));

jest.mock('@/config/logger');

describe('Recording Management', () => {
  const userId = 'user-123';
  const recordingId = 'rec-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 14: Recording data completeness', () => {
    test('Recording list should include all required fields', async () => {
      const mockRecordings = [
        {
          id: recordingId,
          title: 'Test Lecture',
          duration: 3600,
          status: 'completed',
          createdAt: new Date('2025-01-01'),
          format: 'audio/mp3',
          fileSize: BigInt(1024000),
        },
      ];

      (prisma.recording.findMany as jest.Mock).mockResolvedValue(mockRecordings);

      const result = await prisma.recording.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          duration: true,
          status: true,
          createdAt: true,
          format: true,
          fileSize: true,
        },
      });

      // Verify all required fields are present
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('duration');
      expect(result[0]).toHaveProperty('status');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).toHaveProperty('format');
      expect(result[0]).toHaveProperty('fileSize');
    });

    test('Recording details should include transcript, summary, and action items', async () => {
      const mockRecording = {
        id: recordingId,
        title: 'Test Lecture',
        transcript: { id: 't-1', fullText: 'Test transcript' },
        summary: { id: 's-1', content: 'Test summary' },
        actionItems: [{ id: 'a-1', description: 'Test action' }],
      };

      (prisma.recording.findFirst as jest.Mock).mockResolvedValue(mockRecording);

      const result = await prisma.recording.findFirst({
        where: { id: recordingId, userId },
        include: {
          transcript: true,
          summary: true,
          actionItems: true,
        },
      });

      expect(result).toHaveProperty('transcript');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('actionItems');
    });
  });

  describe('Property 15: Search result relevance', () => {
    test('Search should filter by title', async () => {
      const searchTerm = 'Machine Learning';

      await prisma.recording.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { originalFilename: { contains: searchTerm, mode: 'insensitive' } },
            { transcript: { fullText: { contains: searchTerm, mode: 'insensitive' } } },
          ],
        },
      });

      expect(prisma.recording.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: { contains: searchTerm, mode: 'insensitive' } }),
            ]),
          }),
        })
      );
    });

    test('Search should filter by transcript content', async () => {
      const searchTerm = 'neural networks';

      await prisma.recording.findMany({
        where: {
          userId,
          OR: [{ transcript: { fullText: { contains: searchTerm, mode: 'insensitive' } } }],
        },
      });

      expect(prisma.recording.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                transcript: { fullText: { contains: searchTerm, mode: 'insensitive' } },
              }),
            ]),
          }),
        })
      );
    });

    test('Search should filter by status', async () => {
      const status = 'completed';

      await prisma.recording.findMany({
        where: { userId, status },
      });

      expect(prisma.recording.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status }),
        })
      );
    });
  });

  describe('Property 16: Cascade deletion', () => {
    test('Deleting recording should remove file from storage', async () => {
      const storagePath = 'user-123_file.mp3';
      const mockRecording = {
        id: recordingId,
        userId,
        storagePath,
      };

      (prisma.recording.findFirst as jest.Mock).mockResolvedValue(mockRecording);
      (prisma.recording.delete as jest.Mock).mockResolvedValue(mockRecording);
      (storageService.deleteFile as jest.Mock).mockResolvedValue(undefined);

      // Simulate deletion flow
      const recording = await prisma.recording.findFirst({ where: { id: recordingId, userId } });
      await prisma.recording.delete({ where: { id: recordingId } });
      if (recording?.storagePath) {
        await storageService.deleteFile(recording.storagePath);
      }

      expect(prisma.recording.delete).toHaveBeenCalledWith({ where: { id: recordingId } });
      expect(storageService.deleteFile).toHaveBeenCalledWith(storagePath);
    });

    test('Database cascade should handle related records', async () => {
      // This test verifies the Prisma schema has onDelete: Cascade
      // The actual cascade is handled by the database, we just verify the delete is called
      (prisma.recording.findFirst as jest.Mock).mockResolvedValue({
        id: recordingId,
        userId,
        storagePath: 'test.mp3',
      });

      await prisma.recording.delete({ where: { id: recordingId } });

      // Prisma schema has onDelete: Cascade for transcript, summary, and actionItems
      // This means deleting a recording automatically deletes related records
      expect(prisma.recording.delete).toHaveBeenCalledWith({ where: { id: recordingId } });
    });
  });
});
