import { emailQueue } from './index';
import { logger } from '@/config/logger';

interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

// Email processor
emailQueue.process(async (job) => {
  const { to, subject, body, html } = job.data as EmailJobData;
  
  logger.info(`Processing email job ${job.id} to ${to}`);
  
  try {
    // TODO: Implement actual email sending logic (e.g., using nodemailer)
    // For now, just simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    logger.info(`Email sent successfully to ${to}`);
    return { success: true, to, subject };
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
});

// Helper function to add email to queue
export const sendEmail = async (data: EmailJobData) => {
  return await emailQueue.add(data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
};
