import { Prisma, Summary } from '@prisma/client';
import { logger } from '@/config/logger';
import { prisma } from '@/config/prisma';
import { SummaryResult } from '@/types/summarization.types';

export interface CreateSummaryData {
  recordingId: string;
  content: string; // The overview or main text
  sections: SummaryResult['sections'];
  keyPoints: string[];
}

export class SummaryRepository {
  /**
   * Create a new summary for a recording
   */
  async create(data: CreateSummaryData): Promise<Summary> {
    try {
      // Check if summary already exists, if so update it
      const existing = await this.findByRecordingId(data.recordingId);
      if (existing) {
        return this.update(existing.id, data);
      }

      const summary = await prisma.summary.create({
        data: {
          recordingId: data.recordingId,
          content: data.content,
          sections: JSON.parse(JSON.stringify(data.sections)),
          keyPoints: JSON.parse(JSON.stringify(data.keyPoints)),
        },
      });
      logger.info(`Summary created for recording ${data.recordingId}`);
      return summary;
    } catch (error) {
      logger.error(`Error creating summary for recording ${data.recordingId}:`, error);
      throw error;
    }
  }

  /**
   * Find summary by recording ID
   */
  async findByRecordingId(recordingId: string): Promise<Summary | null> {
    try {
      const summary = await prisma.summary.findUnique({
        where: { recordingId },
      });
      return summary;
    } catch (error) {
      logger.error(`Error finding summary for recording ${recordingId}:`, error);
      throw error;
    }
  }

  /**
   * Update summary
   */
  async update(
    id: string,
    data: Partial<Omit<CreateSummaryData, 'recordingId'>>
  ): Promise<Summary> {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.content !== undefined) updateData.content = data.content;
      if (data.sections !== undefined)
        updateData.sections = JSON.parse(JSON.stringify(data.sections));
      if (data.keyPoints !== undefined)
        updateData.keyPoints = JSON.parse(JSON.stringify(data.keyPoints));

      const summary = await prisma.summary.update({
        where: { id },
        data: updateData,
      });
      logger.info(`Summary ${id} updated`);
      return summary;
    } catch (error) {
      logger.error(`Error updating summary ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete summary
   */
  async delete(id: string): Promise<void> {
    try {
      await prisma.summary.delete({
        where: { id },
      });
      logger.info(`Summary ${id} deleted`);
    } catch (error) {
      logger.error(`Error deleting summary ${id}:`, error);
      throw error;
    }
  }
}

export const summaryRepository = new SummaryRepository();
