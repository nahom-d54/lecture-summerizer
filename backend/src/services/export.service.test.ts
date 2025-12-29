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

  describe('Property 21: Export format correctness', () => {
    it('PDF export should return valid PDF buffer', async () => {
      (prisma.recording.findUnique as jest.Mock).mockResolvedValue(mockRecording);

      const result = await exportService.generatePDF(recordingId);

      expect(Buffer.isBuffer(result)).toBe(true);
      // PDF files start with %PDF
      expect(result.toString('utf8', 0, 4)).toBe('%PDF');
    });

    it('TXT export should return plain text string', async () => {
      (prisma.recording.findUnique as jest.Mock).mockResolvedValue(mockRecording);

      const result = await exportService.generateTXT(recordingId);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('DOCX export should return valid DOCX buffer', async () => {
      (prisma.recording.findUnique as jest.Mock).mockResolvedValue(mockRecording);

      const result = await exportService.generateDOCX(recordingId);

      expect(Buffer.isBuffer(result)).toBe(true);
      // DOCX files are ZIP archives starting with PK
      expect(result.toString('utf8', 0, 2)).toBe('PK');
    });
  });

  describe('Property 22: Export content completeness', () => {
    it('Export should include recording title', async () => {
      (prisma.recording.findUnique as jest.Mock).mockResolvedValue(mockRecording);

      const result = await exportService.generateTXT(recordingId);

      expect(result).toContain('Test Lecture');
    });

    it('Export should include recording date', async () => {
      (prisma.recording.findUnique as jest.Mock).mockResolvedValue(mockRecording);

      const result = await exportService.generateTXT(recordingId);

      expect(result).toContain('Date:');
    });

    it('Export should include summary content', async () => {
      (prisma.recording.findUnique as jest.Mock).mockResolvedValue(mockRecording);

      const result = await exportService.generateTXT(recordingId);

      expect(result).toContain('SUMMARY');
      expect(result).toContain('This is a test summary.');
    });

    it('Export should include action items as checklist', async () => {
      (prisma.recording.findUnique as jest.Mock).mockResolvedValue(mockRecording);

      const result = await exportService.generateTXT(recordingId);

      expect(result).toContain('ACTION ITEMS');
      expect(result).toContain('[ ]'); // Uncompleted item
      expect(result).toContain('[x]'); // Completed item
    });

    it('Export should include assignee and deadline for action items', async () => {
      (prisma.recording.findUnique as jest.Mock).mockResolvedValue(mockRecording);

      const result = await exportService.generateTXT(recordingId);

      expect(result).toContain('Alice'); // Assignee
      expect(result).toContain('Due:'); // Deadline indicator
    });
  });
});
