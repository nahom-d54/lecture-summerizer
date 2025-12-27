import { Router } from 'express';
import actionItemRoutes from './action-item.routes';
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

// Action Item routes

router.use('/', actionItemRoutes);

// Upload/Recording routes
router.use('/recordings', uploadRoutes);

export default router;
