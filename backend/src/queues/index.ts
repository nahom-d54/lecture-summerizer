import Queue from 'bull';
import redisClient from '@/config/redis';
import { logger } from '@/config/logger';

// Create queues
export const emailQueue = new Queue('email', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  prefix: process.env.BULL_QUEUE_PREFIX || 'mental-health',
});

export const aiProcessingQueue = new Queue('ai-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  prefix: process.env.BULL_QUEUE_PREFIX || 'mental-health',
});

// Queue event listeners
emailQueue.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job ${job?.id} failed:`, err);
});

aiProcessingQueue.on('completed', (job) => {
  logger.info(`AI processing job ${job.id} completed`);
});

aiProcessingQueue.on('failed', (job, err) => {
  logger.error(`AI processing job ${job?.id} failed:`, err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing queues...');
  await emailQueue.close();
  await aiProcessingQueue.close();
  await redisClient.quit();
});
