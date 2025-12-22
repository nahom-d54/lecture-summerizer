import { Router } from 'express';
import queueRoutes from './queue.routes';

const router = Router();

// Example route
router.get('/', (_req, res) => {
  res.json({
    message: 'AI Mental Health Companion API',
    version: '1.0.0',
  });
});

// Queue management routes
router.use('/queues', queueRoutes);

export default router;
