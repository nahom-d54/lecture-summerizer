import { Router } from 'express';
import authRoutes from './auth.routes';
import queueRoutes from './queue.routes';
import uploadRoutes from './upload.routes';

const router: Router = Router();

// Example route
router.get('/', (_req, res) => {
  res.json({
    message: 'Lecture Summarizer API',
    version: '1.0.0',
  });
});

// Authentication routes
router.use('/auth', authRoutes);

// Queue management routes
router.use('/queues', queueRoutes);

// Upload/Recording routes
router.use('/recordings', uploadRoutes);

export default router;
