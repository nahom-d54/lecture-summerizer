import { prisma } from '@/config/prisma';
import { actionItemService } from '@/services/action-item.service';
import { summarizationService } from '@/services/summarization.service';
import { transcriptionService } from '@/services/transcription.service';
import { processingService } from './processing.service';

jest.mock('@/config/prisma', () => ({
  prisma: {
    recording: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/services/transcription.service', () => ({
  transcriptionService: {
    transcribeRecording: jest.fn(),
  },
}));

jest.mock('@/services/summarization.service', () => ({
  summarizationService: {
    generateSummary: jest.fn(),
  },
}));

jest.mock('@/services/action-item.service', () => ({
  actionItemService: {
    generateActionItems: jest.fn(),
  },
}));

jest.mock('@/config/logger');

describe('ProcessingService', () => {
  const recordingId = 'test-recording-id';
  const storagePath = 'test/path.mp3';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process recording successfully through all stages', async () => {
    (prisma.recording.findUnique as jest.Mock).mockResolvedValue({
      id: recordingId,
      storagePath,
    });

    await processingService.processRecording(recordingId);

    // Verify status updates
    expect(prisma.recording.update).toHaveBeenCalledWith({
      where: { id: recordingId },
      data: { status: 'transcribing' },
    });
    expect(prisma.recording.update).toHaveBeenCalledWith({
      where: { id: recordingId },
      data: { status: 'summarizing' },
    });
    expect(prisma.recording.update).toHaveBeenCalledWith({
      where: { id: recordingId },
      data: { status: 'extracting_action_items' },
    });
    expect(prisma.recording.update).toHaveBeenCalledWith({
      where: { id: recordingId },
      data: { status: 'completed' },
    });

    // Verify service calls
    expect(transcriptionService.transcribeRecording).toHaveBeenCalledWith(recordingId, storagePath);
    expect(summarizationService.generateSummary).toHaveBeenCalledWith(recordingId);
    expect(actionItemService.generateActionItems).toHaveBeenCalledWith(recordingId);
  });

  it('should set status to failed if any stage fails', async () => {
    (prisma.recording.findUnique as jest.Mock).mockResolvedValue({
      id: recordingId,
      storagePath,
    });
    (transcriptionService.transcribeRecording as jest.Mock).mockRejectedValue(
      new Error('Transcription failed')
    );

    await processingService.processRecording(recordingId);

    expect(prisma.recording.update).toHaveBeenCalledWith({
      where: { id: recordingId },
      data: { status: 'failed' },
    });
  });

  it('should fail if recording is not found', async () => {
    (prisma.recording.findUnique as jest.Mock).mockResolvedValue(null);

    await processingService.processRecording(recordingId);

    expect(prisma.recording.update).toHaveBeenCalledWith({
      where: { id: recordingId },
      data: { status: 'failed' },
    });
  });
});
