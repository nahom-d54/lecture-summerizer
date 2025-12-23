import { Router } from 'express';
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

// Queue management routes
router.use('/queues', queueRoutes);

// Upload/Recording routes
router.use('/recordings', uploadRoutes);

export default router;
