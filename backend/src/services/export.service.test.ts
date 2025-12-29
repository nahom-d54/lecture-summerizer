import { prisma } from '@/config/prisma';
import { exportService } from './export.service';

jest.mock('@/config/prisma', () => ({
  prisma: {
    recording: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/config/logger');

describe('ExportService', () => {
  const recordingId = 'test-id';
  const mockRecording = {
    id: recordingId,
    title: 'Test Lecture',
    createdAt: new Date('2025-01-01'),
    summary: {
      content: 'This is a test summary.',
      sections: [
        {
          heading: 'Section 1',
          content: 'Content 1',
          bulletPoints: ['Point A', 'Point B'],
        },
      ],
    },
    actionItems: [
      {
        description: 'Action 1',
        assignee: 'Alice',
        deadline: new Date('2025-02-01'),
        completed: false,
      },
      {
        description: 'Action 2',
        assignee: null,
        deadline: null,
        completed: true,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a TXT export with correct content', async () => {
    (prisma.recording.findUnique as jest.Mock).mockResolvedValue(mockRecording);

    const result = await exportService.generateTXT(recordingId);

    expect(result).toContain('Test Lecture');
    expect(result).toContain('SUMMARY');
    expect(result).toContain('This is a test summary.');
    expect(result).toContain('## Section 1');
    expect(result).toContain('ACTION ITEMS');
    expect(result).toContain('[ ] Action 1 - Alice');
    expect(result).toContain('[x] Action 2');
  });

  it('should generate a PDF export buffer', async () => {
    (prisma.recording.findUnique as jest.Mock).mockResolvedValue(mockRecording);

    const result = await exportService.generatePDF(recordingId);

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should generate a DOCX export buffer', async () => {
    (prisma.recording.findUnique as jest.Mock).mockResolvedValue(mockRecording);

    const result = await exportService.generateDOCX(recordingId);

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should throw error if recording not found', async () => {
    (prisma.recording.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(exportService.generateTXT(recordingId)).rejects.toThrow('Recording not found');
  });
});
