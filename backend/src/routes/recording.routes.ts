import { Router } from 'express';
import multer from 'multer';
import { recordingController } from '@/controllers/recording.controller';
import { authenticateToken } from '@/middleware/authMiddleware';

const router: Router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
});

// All recording routes require authentication
router.use(authenticateToken);

// Create/Upload
router.post('/', upload.single('file'), recordingController.uploadRecording);

// List
router.get('/', recordingController.getRecordings);

// Details
router.get('/:id', recordingController.getRecordingById);

// Status
router.get('/:id/status', recordingController.getRecordingStatus);

// Export
router.get('/:id/export', recordingController.exportRecording);

// Update
router.patch('/:id', recordingController.updateRecording);

// Update Action Item
router.patch('/:id/action-items/:actionItemId', recordingController.updateActionItem);

// Delete
router.delete('/:id', recordingController.deleteRecording);
export default router;
