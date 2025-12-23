import { Request, Response, Router } from 'express';

const router: Router = Router();

// Get queue stats
router.get('/stats', async (_req: Request, res: Response) => {
  // Queues are disabled for this simplified version
  res.json({
    success: true,
    queues: {
      email: { active: 0, waiting: 0, completed: 0, failed: 0 },
      lectureSummarization: { active: 0, waiting: 0, completed: 0, failed: 0 },
    },
  });
});

export default router;
