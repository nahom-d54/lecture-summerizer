import { Prisma, Transcript } from '@prisma/client';
import { logger } from '@/config/logger';
import { prisma } from '@/config/prisma';
import { TranscriptSegment } from '@/types/transcription.types';

export interface CreateTranscriptData {
  recordingId: string;
  fullText: string;
  segments: TranscriptSegment[];
  speakers: string[];
  duration: number;
}

export class TranscriptRepository {
  /**
   * Create a new transcript for a recording
   */
  async create(data: CreateTranscriptData): Promise<Transcript> {
    try {
      const transcript = await prisma.transcript.create({
        data: {
          recordingId: data.recordingId,
          fullText: data.fullText,
          segments: JSON.parse(JSON.stringify(data.segments)),
          speakers: JSON.parse(JSON.stringify(data.speakers)),
          duration: data.duration,
        },
      });
      logger.info(`Transcript created for recording ${data.recordingId}`);
      return transcript;
    } catch (error) {
      logger.error(`Error creating transcript for recording ${data.recordingId}:`, error);
      throw error;
    }
  }

  /**
   * Find transcript by recording ID
   */
  async findByRecordingId(recordingId: string): Promise<Transcript | null> {
    try {
      const transcript = await prisma.transcript.findUnique({
        where: { recordingId },
      });
      return transcript;
    } catch (error) {
      logger.error(`Error finding transcript for recording ${recordingId}:`, error);
      throw error;
    }
  }

  /**
   * Find transcript by ID
   */
  async findById(id: string): Promise<Transcript | null> {
    try {
      const transcript = await prisma.transcript.findUnique({
        where: { id },
      });
      return transcript;
    } catch (error) {
      logger.error(`Error finding transcript by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update transcript
   */
  async update(
    id: string,
    data: Partial<Omit<CreateTranscriptData, 'recordingId'>>
  ): Promise<Transcript> {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.fullText !== undefined) updateData.fullText = data.fullText;
      if (data.segments !== undefined) updateData.segments = data.segments;
      if (data.speakers !== undefined) updateData.speakers = data.speakers;
      if (data.duration !== undefined) updateData.duration = data.duration;

      const transcript = await prisma.transcript.update({
        where: { id },
        data: updateData,
      });
      logger.info(`Transcript ${id} updated`);
      return transcript;
    } catch (error) {
      logger.error(`Error updating transcript ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete transcript
   */
  async delete(id: string): Promise<void> {
    try {
      await prisma.transcript.delete({
        where: { id },
      });
      logger.info(`Transcript ${id} deleted`);
    } catch (error) {
      logger.error(`Error deleting transcript ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get segments with low confidence scores
   */
  async getLowConfidenceSegments(
    recordingId: string,
    threshold = 0.7
  ): Promise<TranscriptSegment[]> {
    try {
      const transcript = await this.findByRecordingId(recordingId);
      if (!transcript) return [];

      const segments = transcript.segments as unknown as TranscriptSegment[];
      return segments.filter(segment => segment.confidence < threshold);
    } catch (error) {
      logger.error(`Error getting low confidence segments for ${recordingId}:`, error);
      throw error;
    }
  }
}

export const transcriptRepository = new TranscriptRepository();
