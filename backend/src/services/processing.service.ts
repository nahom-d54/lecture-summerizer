import { logger } from '@/config/logger';
import { prisma } from '@/config/prisma';
import { actionItemService } from '@/services/action-item.service';
import { summarizationService } from '@/services/summarization.service';
import { transcriptionService } from '@/services/transcription.service';

export class ProcessingService {
  /**
   * Orchestrate the full processing pipeline for a recording
   * Triggered asynchronously after upload
   */
  async processRecording(recordingId: string): Promise<void> {
    try {
      logger.info(`Starting processing pipeline for recording: ${recordingId}`);

      // 1. Fetch the recording to get the storage path
      const recording = await prisma.recording.findUnique({
        where: { id: recordingId },
      });

      if (!recording) {
        throw new Error(`Recording not found: ${recordingId}`);
      }

      // 2. Transcribe
      logger.info(`Step 1: Transcription for ${recordingId}`);
      await this.updateStatus(recordingId, 'transcribing');
      await transcriptionService.transcribeRecording(recordingId, recording.storagePath);

      // 3. Summarize
      logger.info(`Step 2: Summarization for ${recordingId}`);
      await this.updateStatus(recordingId, 'summarizing');
      await summarizationService.generateSummary(recordingId);

      // 4. Action Items
      logger.info(`Step 3: Action Item Extraction for ${recordingId}`);
      await this.updateStatus(recordingId, 'extracting_action_items');
      await actionItemService.generateActionItems(recordingId);

      // 5. Update status to completed
      await this.updateStatus(recordingId, 'completed');
      logger.info(`Processing pipeline completed successfully for recording: ${recordingId}`);
    } catch (error) {
      logger.error(`Processing pipeline failed for recording ${recordingId}:`, error);
      await this.updateStatus(recordingId, 'failed');
    }
  }

  /**
   * Helper to update recording status
   */
  private async updateStatus(recordingId: string, status: string): Promise<void> {
    await prisma.recording.update({
      where: { id: recordingId },
      data: { status },
    });
  }
}

export const processingService = new ProcessingService();
