import { Router, Request, Response } from 'express';
import { emailQueue, aiProcessingQueue } from '@/queues';

const router = Router();

// Get queue stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [emailCounts, aiCounts] = await Promise.all([
      emailQueue.getJobCounts(),
      aiProcessingQueue.getJobCounts(),
    ]);

    res.json({
      success: true,
      queues: {
        email: emailCounts,
        aiProcessing: aiCounts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch queue stats',
    });
  }
});

export default router;
