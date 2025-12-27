import { Router } from 'express';
import { actionItemController } from '@/controllers/action-item.controller';
import { authenticateToken } from '@/middleware/authMiddleware'; // Matches your provided file

const router = Router();

// 1. Generate Action Items (AI Trigger)
// POST /api/recordings/123/action-items
router.post(
  '/recordings/:recordingId/action-items',
  authenticateToken,
  actionItemController.generate
);

// 2. Get Action Items
// GET /api/recordings/123/action-items
router.get(
  '/recordings/:recordingId/action-items',
  authenticateToken,
  actionItemController.getByRecording
);

// 3. Update Action Item (Toggle Checkbox / Edit)
// PATCH /api/action-items/abc-xyz
router.patch('/action-items/:id', authenticateToken, actionItemController.update);

export default router;
