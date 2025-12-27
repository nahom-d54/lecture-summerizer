import { ActionItem, Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma';

export const actionItemRepository = {
  // Create multiple action items in bulk

  async createMany(data: Prisma.ActionItemCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return prisma.actionItem.createMany({
      data,
    });
  },

  // Find action items by recording ID

  async findByRecordingId(recordingId: string): Promise<ActionItem[]> {
    return prisma.actionItem.findMany({
      where: { recordingId },
      orderBy: { createdAt: 'asc' },
    });
  },

  // Update a specific action item

  async update(id: string, data: Prisma.ActionItemUpdateInput): Promise<ActionItem> {
    return prisma.actionItem.update({
      where: { id },
      data,
    });
  },

  // Delete an action item

  async delete(id: string): Promise<ActionItem> {
    return prisma.actionItem.delete({
      where: { id },
    });
  },
};
