import { Router } from 'express';
import multer from 'multer';
import { uploadRecording } from '@/controllers/uploadController';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB safety limit at multer level too
});

router.post('/', upload.single('file'), uploadRecording);

export default router;
