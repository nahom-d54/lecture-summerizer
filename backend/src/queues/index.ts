import Queue from 'bull';
import { logger } from '@/config/logger';
import redisClient from '@/config/redis';

// Create queues
export const emailQueue = new Queue('email', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  prefix: process.env.BULL_QUEUE_PREFIX || 'lecture-summarizer',
});

export const aiProcessingQueue = new Queue('lecture-summarization', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  prefix: process.env.BULL_QUEUE_PREFIX || 'lecture-summarizer',
});

// Queue event listeners
emailQueue.on('completed', job => {
  logger.info(`Email job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job ${job?.id} failed:`, err);
});

aiProcessingQueue.on('completed', job => {
  logger.info(`Lecture summarization job ${job.id} completed`);
});

aiProcessingQueue.on('failed', (job, err) => {
  logger.error(`Lecture summarization job ${job?.id} failed:`, err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing queues...');
  await emailQueue.close();
  await aiProcessingQueue.close();
  await redisClient.quit();
});
