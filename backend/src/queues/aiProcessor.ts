import { logger } from '@/config/logger';
import { aiProcessingQueue } from './index';

interface AIJobData {
  userId: string;
  lectureId: string;
  content: string;
  options?: {
    summaryLength?: 'short' | 'medium' | 'detailed';
    includeKeyPoints?: boolean;
  };
}

// AI processing processor
aiProcessingQueue.process(async job => {
  const { userId, lectureId, content } = job.data as AIJobData;

  logger.info(`Processing lecture summarization job ${job.id} for user ${userId}`);

  try {
    // TODO: Implement actual AI/LLM summarization logic
    // For now, just simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const summary = `Summary of lecture content: ${content.substring(0, 100)}...`;

    logger.info(`Lecture summarization completed for lecture ${lectureId}`);
    return { success: true, summary, lectureId };
  } catch (error) {
    logger.error(`Failed to process lecture summarization for user ${userId}:`, error);
    throw error;
  }
});

// Helper function to add lecture summarization job to queue
export const summarizeLecture = async (data: AIJobData) => {
  return await aiProcessingQueue.add(data, {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 5000,
    },
    timeout: 60000, // 60 seconds timeout for longer lectures
  });
};
