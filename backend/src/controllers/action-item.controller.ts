import { Request, Response } from 'express';
import { logger } from '@/config/logger';
import { actionItemRepository } from '@/repositories/action-item.repository';
import { actionItemService } from '@/services/action-item.service';

export class ActionItemController {
  // POST /api/recordings/:recordingId/action-items
  //  Triggers the AI to find action items

  async generate(req: Request, res: Response) {
    const { recordingId } = req.params;

    if (!recordingId) {
      return res.status(400).json({ success: false, error: 'Recording ID is required' });
    }

    try {
      const items = await actionItemService.generateActionItems(recordingId);
      return res.status(201).json({ success: true, data: items });
    } catch (error) {
      logger.error(`Failed to generate action items for ${recordingId}`, error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate action items',
      });
    }
  }

  // GET /api/recordings/:recordingId/action-items
  // Fetches existing items from DB

  async getByRecording(req: Request, res: Response) {
    const { recordingId } = req.params;

    try {
      const items = await actionItemRepository.findByRecordingId(recordingId);
      return res.json({ success: true, data: items });
    } catch (error) {
      logger.error(`Failed to fetch action items for ${recordingId}`, error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch action items',
      });
    }
  }

  // PATCH /api/action-items/:id
  // Updates an item (e.g., toggling "completed")

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body;

    try {
      const item = await actionItemService.updateActionItem(id, updates);
      return res.json({ success: true, data: item });
    } catch (error) {
      logger.error(`Failed to update action item ${id}`, error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update action item',
      });
    }
  }
}

export const actionItemController = new ActionItemController();
