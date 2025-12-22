import { Request, Response, Router } from 'express';
import { aiProcessingQueue, emailQueue } from '@/queues';

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
        lectureSummarization: aiCounts,
      },
    });
  } catch (_error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch queue stats',
    });
  }
});

export default router;
